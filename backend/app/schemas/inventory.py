from datetime import date
from pydantic import BaseModel, ConfigDict, Field, model_validator

class InventoryCreate(BaseModel):
    refrigerator_id: int
    item_name: str = Field(
        min_length=1,
        max_length=100
    )

    item_type: str | None = Field(
        default=None,
        max_length=50
    )

    category: str | None = Field(
        default=None,
        max_length=50
    )

    unit: str | None = Field(
        default=None,
        max_length=30
    )

    quantity: float = Field(gt=0)

    storage_type: str | None = Field(
        default=None,
        max_length=50
    )

    date_added: date
    expiry_date: date | None = None
    is_homemade: bool = False
    cooked_date: date | None = None

    shelf_life_days: int | None = Field(
        default=None,
        gt=0
    )

    storage_information: str | None = Field(
        default=None,
        max_length=500
    )

    image_url: str | None = Field(
        default=None,
        max_length=500
    )

    estimated_price: float | None = Field(
        default=None,
        ge=0
    )

    notes: str | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.expiry_date is not None
            and self.expiry_date < self.date_added
        ):
            raise ValueError("Expiry date cannot be earlier than date added")

        if self.is_homemade:
            if self.cooked_date is None:
                raise ValueError("Cooked date is required for homemade meals")

            if self.shelf_life_days is None:
                raise ValueError("Shelf life is required for homemade meals")

        return self


class InventoryResponse(BaseModel):
    item_id: int
    refrigerator_id: int
    added_by: int
    item_name: str
    item_type: str | None
    category: str | None
    unit: str | None
    quantity: float
    storage_type: str | None
    date_added: date
    expiry_date: date | None
    is_homemade: bool
    cooked_date: date | None
    shelf_life_days: int | None
    storage_information: str | None
    image_url: str | None
    estimated_price: float | None
    notes: str | None
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )