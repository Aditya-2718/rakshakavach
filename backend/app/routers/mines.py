"""Mine sites router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/mines", tags=["Mine Sites"])


@router.get("", response_model=List[schemas.MineSiteOut])
def list_mines(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    mines = db.query(models.CoalMineSite).all()
    return [schemas.MineSiteOut.from_orm_mapped(m) for m in mines]


@router.get("/{mine_id}", response_model=schemas.MineSiteOut)
def get_mine(
    mine_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    mine = db.query(models.CoalMineSite).filter(models.CoalMineSite.id == mine_id).first()
    if not mine:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Mine not found")
    return schemas.MineSiteOut.from_orm_mapped(mine)
