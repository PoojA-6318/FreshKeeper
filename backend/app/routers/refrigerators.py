from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..database import SessionLocal
from ..models.household import Household
from ..models.refrigerator import Refrigerator
from ..schemas.refrigerator import RefrigeratorCreate, RefrigeratorResponse

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
    household = db.query(Household).filter(
        Household.household_id == refrigerator_data.household_id
    ).first()

    if not household:
        raise HTTPException(
            status_code=404,
            detail="Household not found"
        )

    if household.created_by != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this household"
        )

    refrigerator = Refrigerator(
        household_id=refrigerator_data.household_id,
        refrigerator_name=refrigerator_data.refrigerator_name,
        location=refrigerator_data.location
    )

    db.add(refrigerator)
    db.commit()
    db.refresh(refrigerator)

    return refrigerator

@router.get("", response_model=list[RefrigeratorResponse])
def get_refrigerators(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerators = (
        db.query(Refrigerator)
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Household.created_by == current_user.user_id
        )
        .all()
    )

    return refrigerators

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
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    return refrigerator

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
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            Household.created_by == current_user.user_id
        )
        .first()
    )

    if not refrigerator:
        raise HTTPException(
            status_code=404,
            detail="Refrigerator not found"
        )

    refrigerator.household_id = refrigerator_data.household_id
    refrigerator.refrigerator_name = refrigerator_data.refrigerator_name
    refrigerator.location = refrigerator_data.location

    db.commit()
    db.refresh(refrigerator)

    return refrigerator

@router.delete("/{refrigerator_id}")
def delete_refrigerator(
    refrigerator_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    refrigerator = (
        db.query(Refrigerator)
        .join(
            Household,
            Refrigerator.household_id == Household.household_id
        )
        .filter(
            Refrigerator.refrigerator_id == refrigerator_id,
            Household.created_by == current_user.user_id
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
