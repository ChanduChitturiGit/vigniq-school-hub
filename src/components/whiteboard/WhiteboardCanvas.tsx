
import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Textbox, Path } from 'fabric';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  Square, 
  Circle as CircleIcon, 
  Triangle as TriangleIcon,
  Type,
  Plus,
  Download,
  FileText,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface WhiteboardCanvasProps {
  onCanvasChange?: (canvas: FabricCanvas | null) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ onCanvasChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'text' | 'rectangle' | 'circle' | 'triangle'>('select');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [slides, setSlides] = useState<string[]>(['slide-1']);
  const [currentSlide, setCurrentSlide] = useState(0);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 2;

    setFabricCanvas(canvas);
    onCanvasChange?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, [currentSlide]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 80,
      });
      fabricCanvas.add(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
    } else if (tool === 'triangle') {
      const triangle = new Triangle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(triangle);
    } else if (tool === 'text') {
      const textbox = new Textbox('Click to edit text', {
        left: 100,
        top: 100,
        width: 200,
        fontSize: fontSize,
        fontFamily: 'Arial',
        fill: activeColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
      });
      fabricCanvas.add(textbox);
      fabricCanvas.setActiveObject(textbox);
      textbox.enterEditing();
    }
  };

  const updateTextStyle = (property: 'bold' | 'italic' | 'underline' | 'fontSize' | 'color') => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      const textbox = activeObject as Textbox;
      
      switch (property) {
        case 'bold':
          setIsBold(!isBold);
          textbox.set('fontWeight', !isBold ? 'bold' : 'normal');
          break;
        case 'italic':
          setIsItalic(!isItalic);
          textbox.set('fontStyle', !isItalic ? 'italic' : 'normal');
          break;
        case 'underline':
          setIsUnderline(!isUnderline);
          textbox.set('underline', !isUnderline);
          break;
        case 'fontSize':
          textbox.set('fontSize', fontSize);
          break;
        case 'color':
          textbox.set('fill', activeColor);
          break;
      }
      fabricCanvas.renderAll();
    }
  };

  const addSlide = () => {
    const newSlideId = `slide-${slides.length + 1}`;
    setSlides([...slides, newSlideId]);
    setCurrentSlide(slides.length);
  };

  const switchSlide = (index: number) => {
    if (fabricCanvas) {
      // Save current slide data before switching
      const slideData = JSON.stringify(fabricCanvas.toJSON());
      localStorage.setItem(`whiteboard-slide-${currentSlide}`, slideData);
      
      // Clear canvas and load new slide
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = '#ffffff';
      
      const savedSlideData = localStorage.getItem(`whiteboard-slide-${index}`);
      if (savedSlideData) {
        fabricCanvas.loadFromJSON(JSON.parse(savedSlideData), () => {
          fabricCanvas.renderAll();
        });
      }
    }
    setCurrentSlide(index);
  };

  const exportToPDF = () => {
    if (!fabricCanvas) return;

    const pdf = new jsPDF();
    
    slides.forEach((slide, index) => {
      if (index > 0) pdf.addPage();
      
      let slideData;
      if (index === currentSlide) {
        slideData = fabricCanvas.toDataURL({ format: 'png' });
      } else {
        const savedData = localStorage.getItem(`whiteboard-slide-${index}`);
        if (savedData) {
          const tempCanvas = new FabricCanvas(document.createElement('canvas'));
          tempCanvas.loadFromJSON(JSON.parse(savedData), () => {
            slideData = tempCanvas.toDataURL({ format: 'png' });
            tempCanvas.dispose();
          });
        }
      }
      
      if (slideData) {
        pdf.addImage(slideData, 'PNG', 10, 10, 190, 150);
      }
    });
    
    pdf.save('whiteboard-content.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToWord = async () => {
    if (!fabricCanvas) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Whiteboard Content",
                bold: true,
                size: 32,
              }),
            ],
          }),
          ...slides.map((slide, index) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `Slide ${index + 1}`,
                  bold: true,
                  size: 24,
                }),
              ],
            })
          ),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer]), 'whiteboard-content.docx');
    toast.success('Word document exported successfully!');
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTool('select')}
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
            >
              Select
            </Button>
            <Button
              onClick={() => setActiveTool('draw')}
              variant={activeTool === 'draw' ? 'default' : 'outline'}
              size="sm"
            >
              Pen
            </Button>
          </div>

          {/* Shapes */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleToolClick('rectangle')}
              variant="outline"
              size="sm"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleToolClick('circle')}
              variant="outline"
              size="sm"
            >
              <CircleIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleToolClick('triangle')}
              variant="outline"
              size="sm"
            >
              <TriangleIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Text Tools */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleToolClick('text')}
              variant={activeTool === 'text' ? 'default' : 'outline'}
              size="sm"
            >
              <Type className="w-4 h-4" />
              Text
            </Button>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => {
                setFontSize(parseInt(e.target.value));
                updateTextStyle('fontSize');
              }}
              className="w-16"
            />
            <span className="text-sm text-gray-600">{fontSize}px</span>
            <Button
              onClick={() => updateTextStyle('bold')}
              variant={isBold ? 'default' : 'outline'}
              size="sm"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => updateTextStyle('italic')}
              variant={isItalic ? 'default' : 'outline'}
              size="sm"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => updateTextStyle('underline')}
              variant={isUnderline ? 'default' : 'outline'}
              size="sm"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setActiveColor(color);
                  updateTextStyle('color');
                }}
                className={`w-6 h-6 rounded border-2 ${
                  activeColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={handleClear} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={exportToWord} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Word
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      {/* Slides */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Slides:</span>
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <Button
                key={slide}
                onClick={() => switchSlide(index)}
                variant={currentSlide === index ? 'default' : 'outline'}
                size="sm"
              >
                {index + 1}
              </Button>
            ))}
            <Button onClick={addSlide} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
              Add Slide
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
