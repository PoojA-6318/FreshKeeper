from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models.household import Household
from ..models.household_member import HouseholdMember
from ..models.user import User
from ..schemas.household import (
    HouseholdCreate,
    HouseholdMemberAdd,
    HouseholdResponse,
)
from ..auth import get_current_user


router = APIRouter(
    prefix="/households",
    tags=["Households"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_household_response(
    household: Household,
    current_user_id: int
):
    members = []

    my_role = None

    for member in household.members:
        if member.user is None:
            continue

        if member.user_id == current_user_id:
            my_role = member.role

        members.append({
            "membership_id": member.member_id,
            "role": member.role,
            "joined_on": member.joined_on,
            "user": {
                "user_id": member.user.user_id,
                "full_name": member.user.full_name,
                "email": member.user.email,
            }
        })

    return {
        "household_id": household.household_id,
        "household_name": household.household_name,
        "created_at": household.created_at,
        "created_by": household.created_by,
        "my_role": my_role,
        "members": members,
    }


@router.post("")
def create_household(
    household_data: HouseholdCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check whether this user is already a member
    existing_membership = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="You are already a member of a household"
        )

    household = Household(
        household_name=household_data.household_name,
        created_by=current_user.user_id
    )

    db.add(household)
    db.flush()

    owner_membership = HouseholdMember(
        user_id=current_user.user_id,
        household_id=household.household_id,
        role="OWNER",
        joined_on=datetime.utcnow()
    )

    db.add(owner_membership)
    db.commit()
    db.refresh(household)

    return build_household_response(
        household,
        current_user.user_id
    )


@router.get("")
def get_my_households(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.user_id == current_user.user_id
        )
        .all()
    )

    households = []

    for membership in memberships:
        household = (
            db.query(Household)
            .filter(
                Household.household_id == membership.household_id
            )
            .first()
        )

        if household:
            households.append(
                build_household_response(
                    household,
                    current_user.user_id
                )
            )

    return households


@router.get("/{household_id}")
def get_household(
    household_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this household"
        )

    household = (
        db.query(Household)
        .filter(
            Household.household_id == household_id
        )
        .first()
    )

    if not household:
        raise HTTPException(
            status_code=404,
            detail="Household not found"
        )

    return build_household_response(
        household,
        current_user.user_id
    )


@router.post("/{household_id}/members")
def add_household_member(
    household_id: int,
    member_data: HouseholdMemberAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Current user must be a member of the household
    current_membership = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not current_membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this household"
        )

    # Only owner can add members
    if current_membership.role != "OWNER":
        raise HTTPException(
            status_code=403,
            detail="Only the household owner can add members"
        )

    # Find user by email
    user = (
        db.query(User)
        .filter(
            User.email == member_data.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No registered user found with this email"
        )

    # Prevent duplicate membership
    existing_membership = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.user_id == user.user_id
        )
        .first()
    )

    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="User is already a member of this household"
        )

    new_member = HouseholdMember(
        user_id=user.user_id,
        household_id=household_id,
        role="MEMBER",
        joined_on=datetime.utcnow()
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {
        "message": "Member added successfully",
        "membership_id": new_member.member_id,
        "role": new_member.role,
        "joined_on": new_member.joined_on,
        "user": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
        }
    }


@router.delete("/{household_id}/members/{member_id}")
def remove_household_member(
    household_id: int,
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Current user must be the owner
    current_membership = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not current_membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this household"
        )

    if current_membership.role != "OWNER":
        raise HTTPException(
            status_code=403,
            detail="Only the household owner can remove members"
        )

    member = (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.member_id == member_id,
            HouseholdMember.household_id == household_id
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Household member not found"
        )

    if member.role == "OWNER":
        raise HTTPException(
            status_code=400,
            detail="The household owner cannot be removed"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member removed successfully"
    }