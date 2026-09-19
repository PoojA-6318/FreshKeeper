from datetime import datetime

from pydantic import BaseModel, Field


class HouseholdCreate(BaseModel):
    household_name: str = Field(
        min_length=1,
        max_length=100
    )


class HouseholdMemberAdd(BaseModel):
    email: str


class HouseholdUserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str


class HouseholdMemberResponse(BaseModel):
    membership_id: int
    role: str
    joined_on: datetime
    user: HouseholdUserResponse


class HouseholdResponse(BaseModel):
    household_id: int
    household_name: str
    created_at: datetime
    created_by: int
    my_role: str
    members: list[HouseholdMemberResponse]