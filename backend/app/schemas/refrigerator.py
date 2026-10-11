from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RefrigeratorCreate(BaseModel):
    household_id: int
    name: str = Field(min_length=1, max_length=100)
    storage_type: str = Field(
        default="refrigerator",
        max_length=30
    )
    location: str | None = Field(
        default=None,
        max_length=100
    )

class RefrigeratorResponse(BaseModel):
    refrigerator_id: int
    #refrigerator_name: str
    household_id: int
    name: str
    storage_type: str
    location: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)