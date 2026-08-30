// EditFood wraps AddFood in edit mode, receiving the item ID from the URL
import AddFood from './AddFood';

export default function EditFood() {
  return <AddFood editMode={true} />;
}
