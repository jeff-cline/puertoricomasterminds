// components/rank/rank-list.tsx
"use client";
import { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RankableItem {
  id: string;
  title: string;
  image_url: string;
}

function Row({ item, position }: { item: RankableItem; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 hover:bg-muted" aria-label="Drag to reorder">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-prm-coral text-lg font-bold text-white">
        {position}
      </div>
      <img src={item.image_url} alt="" className="h-12 w-16 rounded object-cover" />
      <span className="flex-1 font-medium text-secondary">{item.title}</span>
    </div>
  );
}

export function RankList({
  items,
  onSubmit,
}: {
  items: RankableItem[];
  onSubmit: (orderedIds: string[]) => void;
}) {
  const [ordered, setOrdered] = useState(items);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrdered((cur) => {
      const oldIdx = cur.findIndex((x) => x.id === active.id);
      const newIdx = cur.findIndex((x) => x.id === over.id);
      return arrayMove(cur, oldIdx, newIdx);
    });
  }

  return (
    <div className="space-y-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {ordered.map((it, i) => <Row key={it.id} item={it} position={i + 1} />)}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={() => onSubmit(ordered.map((x) => x.id))} className="w-full bg-prm-coral hover:bg-prm-coral/90 text-white">
        Submit Rankings
      </Button>
    </div>
  );
}
