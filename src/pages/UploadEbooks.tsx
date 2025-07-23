import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, Plus, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ChapterFile {
  id: string;
  name: string;
  file: File | null;
}

const UploadEbooks: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    board: '',
    class: '',
    subject: '',
    uploadType: ''
  });
  const [contentPdf, setContentPdf] = useState<File | null>(null);
  const [chapterFiles, setChapterFiles] = useState<ChapterFile[]>([
    { id: '1', name: 'Chapter-1 PDF', file: null }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const boards = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Hindi', 'Computer Science'];
  const uploadTypes = ['Chapter Wise PDF', 'Single PDF'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setContentPdf(file);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleChapterFileChange = (id: string, file: File | null) => {
    setChapterFiles(prev => 
      prev.map(chapter => 
        chapter.id === id ? { ...chapter, file } : chapter
      )
    );
  };

  const addNewChapter = () => {
    const newId = (chapterFiles.length + 1).toString();
    setChapterFiles(prev => [...prev, {
      id: newId,
      name: `Chapter-${newId} PDF`,
      file: null
    }]);
  };

  const removeChapter = (id: string) => {
    if (chapterFiles.length > 1) {
      setChapterFiles(prev => prev.filter(chapter => chapter.id !== id));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.board || !formData.class || !formData.subject || !formData.uploadType) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.uploadType === 'Chapter Wise PDF') {
      const hasFiles = chapterFiles.some(chapter => chapter.file);
      if (!hasFiles) {
        toast.error('Please upload at least one chapter PDF');
        return;
      }
    } else if (formData.uploadType === 'Single PDF' && !contentPdf) {
      toast.error('Please upload the content PDF');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      toast.success('E-book uploaded successfully!');
      
      // Reset form
      setFormData({
        board: '',
        class: '',
        subject: '',
        uploadType: ''
      });
      setContentPdf(null);
      setChapterFiles([{ id: '1', name: 'Chapter-1 PDF', file: null }]);
    }, 2000);
  };

  const handleCancel = () => {
    setFormData({
      board: '',
      class: '',
      subject: '',
      uploadType: ''
    });
    setContentPdf(null);
    setChapterFiles([{ id: '1', name: 'Chapter-1 PDF', file: null }]);
  };

  return (
    <MainLayout pageTitle="Upload E-books">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload E-books</h1>
          <p className="text-gray-600 mt-2">Upload educational materials for students</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">E-book Upload Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Board and Class Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board Name</label>
                  <Select value={formData.board} onValueChange={(value) => handleInputChange('board', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((board) => (
                        <SelectItem key={board} value={board}>{board}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ebook Upload Type</label>
                <Select value={formData.uploadType} onValueChange={(value) => handleInputChange('uploadType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Upload Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {uploadTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional File Upload Sections */}
              {formData.uploadType === 'Single PDF' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content PDF</label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleContentPdfChange}
                      className="pl-10"
                    />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {contentPdf && (
                    <p className="text-sm text-green-600 mt-2">Selected: {contentPdf.name}</p>
                  )}
                </div>
              )}

              {formData.uploadType === 'Chapter Wise PDF' && (
                <div className="space-y-4">
                  {chapterFiles.map((chapter) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">{chapter.name}</h4>
                        {chapterFiles.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChapter(chapter.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleChapterFileChange(chapter.id, e.target.files?.[0] || null)}
                          className="pl-10"
                        />
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      {chapter.file && (
                        <p className="text-sm text-green-600 mt-2">Selected: {chapter.file.name}</p>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewChapter}
                    className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Chapter
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Ebook
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UploadEbooks;
