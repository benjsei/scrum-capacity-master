import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DefaultPracticeCard } from './DefaultPracticeCard';

interface DefaultPracticeListProps {
  practices: any[];
  onEdit: (practice: any) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: any) => void;
}

export const DefaultPracticeList = ({ practices, onEdit, onDelete, onDragEnd }: DefaultPracticeListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={practices.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-4">
          {practices.map((practice) => (
            <DefaultPracticeCard
              key={practice.id}
              practice={practice}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};