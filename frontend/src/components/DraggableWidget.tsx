import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface DraggableWidgetProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  defaultPosition = { x: 20, y: 20 },
  width = "360px",
  height = "auto"
}) => {
  const [pos, setPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Inicializar width/height directos en el DOM para no perderlos al renderizar
  // y permitir el 'resize: both' nativo por CSS
  useEffect(() => {
    if (widgetRef.current) {
      if (!widgetRef.current.style.width) widgetRef.current.style.width = width;
      if (!widgetRef.current.style.height) widgetRef.current.style.height = height;
    }
  }, [width, height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      let newX = dragRef.current.initialX + dx;
      let newY = dragRef.current.initialY + dy;
      
      if (newY < 0) newY = 0;
      if (newY > window.innerHeight - 50) newY = window.innerHeight - 50;
      if (newX < 0) newX = 0;
      if (newX > window.innerWidth - 100) newX = window.innerWidth - 100;
      
      setPos({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  if (!isOpen) return null;

  return (
      <div 
      ref={widgetRef}
      className={`fixed bg-white shadow-2xl z-40 flex flex-col border border-gray-300 font-sans ${isMinimized ? '!h-auto' : ''}`}
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`, 
        maxHeight: isMinimized ? 'auto' : '90vh',
        minWidth: isMinimized ? 'auto' : 'min(250px, 90vw)',
        maxWidth: 'calc(100vw - 20px)',
        minHeight: isMinimized ? 'auto' : '150px',
        height: isMinimized ? 'auto' : undefined,
        resize: isMinimized ? 'none' : 'both',
        overflow: 'hidden'
      }}
    >
      {/* Header (Draggable) */}
      <div 
        className="bg-[#111111] text-white p-2.5 flex items-center justify-between cursor-move select-none shrink-0"
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-[12px] font-bold tracking-wide ml-1">{title}</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
            className="text-gray-400 hover:text-white p-1"
            title={isMinimized ? "Expandir" : "Contraer"}
          >
            {isMinimized ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="text-gray-400 hover:text-white p-1"
            title="Cerrar"
          >
            <X size={14}/>
          </button>
        </div>
      </div>

      {/* Contenido */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default DraggableWidget;
