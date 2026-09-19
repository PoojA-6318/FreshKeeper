from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import SessionLocal
from ..models.household import Household
from ..models.household_member import HouseholdMember
from ..models.refrigerator import Refrigerator
from ..schemas.refrigerator import (
    RefrigeratorCreate,
    RefrigeratorResponse,
)

router = APIRouter(
    prefix="/refrigerators",
    tags=["Refrigerators"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_household_membership(
    household_id: int,
    user_id: int,
    db: Session
):
    return (
        db.query(HouseholdMember)
        .filter(
            HouseholdMember.household_id == household_id,
            HouseholdMember.user_id == user_id
        )
        .first()
    )


def build_refrigerator_response(refrigerator: Refrigerator):
    return {
        "refrigerator_id": refrigerator.refrigerator_id,
        "household_id": refrigerator.household_id,
        "name": refrigerator.refrigerator_name,
        "storage_type": refrigerator.storage_type,
        "location": refrigerator.location,
        "created_at": refrigerator.created_at,
    }


@router.post(
    "",
    response_model=RefrigeratorResponse,
    status_code=201
)
def create_refrigerator(
    refrigerator_data: RefrigeratorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    household = (
        db.query(Household)
        .filter(Household.household_id == refrigerator_data.household_id)
        .first()
    )

    if not household:
        raise HTTPException(
            status_code=404,
            detail="Household not found"
        )

    membership = get_household_membership(
        refrigerator_data.household_id,
        current_user.user_id,
        db
    )

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this household"
        )

    refrigerator = Refrigerator(
        household_id=refrigerator_data.household_id,
        refrigerator_name=refrigerator_data.name,
        storage_type=refrigerator_data.storage_type,
        location=refrigerator_data.location
    )

    db.add(refrigerator)
    db.commit()
    db.refresh(refrigerator)

    return build_refrigerator_response(refrigerator)


@router.get(
    "",
    response_model=list[RefrigeratorResponse]
)
def get_refrigerators(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerators = (
        db.query(Refrigerator)
        .join(
            HouseholdMember,
            Refrigerator.household_id == HouseholdMember.household_id
        )
        .filter(HouseholdMember.user_id == current_user.user_id)
        .all()
    )

    return [
        build_refrigerator_response(refrigerator)
        for refrigerator in refrigerators
    ]


@router.get(
    "/{refrigerator_id}",
    response_model=RefrigeratorResponse
)
def get_refrigerator(
    refrigerator_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            HouseholdMember,
            Refrigerator.household_id == HouseholdMember.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    return build_refrigerator_response(refrigerator)


@router.put(
    "/{refrigerator_id}",
    response_model=RefrigeratorResponse
)
def update_refrigerator(
    refrigerator_id: int,
    refrigerator_data: RefrigeratorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            HouseholdMember,
            Refrigerator.household_id == HouseholdMember.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    # Verify the user is also a member
    # of the household they are moving it to.
    new_household_membership = get_household_membership(
        refrigerator_data.household_id,
        current_user.user_id,
        db
    )

    if not new_household_membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of the target household"
        )

    target_household = (
        db.query(Household)
        .filter(Household.household_id == refrigerator_data.household_id)
        .first()
    )

    if not target_household:
        raise HTTPException(
            status_code=404,
            detail="Target household not found"
        )

    refrigerator.household_id = refrigerator_data.household_id
    refrigerator.refrigerator_name = refrigerator_data.name
    refrigerator.storage_type = refrigerator_data.storage_type
    refrigerator.location = refrigerator_data.location

    db.commit()
    db.refresh(refrigerator)

    return build_refrigerator_response(refrigerator)


@router.delete(
    "/{refrigerator_id}"
)
def delete_refrigerator(
    refrigerator_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            HouseholdMember,
            Refrigerator.household_id ==
            HouseholdMember.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            HouseholdMember.user_id == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    db.delete(refrigerator)
    db.commit()

    return {
        "message": "Refrigerator deleted successfully"
    }