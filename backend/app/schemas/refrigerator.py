from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RefrigeratorCreate(BaseModel):
    household_id: int
    refrigerator_name: str
    location: str | None = None

class RefrigeratorResponse(BaseModel):
    refrigerator_id: int
    household_id: int
    refrigerator_name: str
    location: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
