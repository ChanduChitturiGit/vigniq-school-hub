
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Upload, Plus, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { createSchool as createSchoolApi, getBoardsList } from '../services/school'
import { SpinnerOverlay } from '../pages/SpinnerOverlay';
import { useSnackbar } from "../components/snackbar/SnackbarContext";
import { getClassesList } from '@/services/class';
import { getSubjectsList } from '@/services/subject';
import { uploadEbook } from '../services/ebooks'

interface ChapterFile {
  id: string;
  name: string;
  file: File | null;
  uploadProgress: number;
  isUploading: boolean;
}

const UploadEbooks: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    board: '',
    class: '',
    subject: '',
    uploadType: ''
  });
  const [contentPdf, setContentPdf] = useState<File | null>(null);
  const [contentPdfProgress, setContentPdfProgress] = useState(0);
  const [isContentPdfUploading, setIsContentPdfUploading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapterFiles, setChapterFiles] = useState<ChapterFile[]>([
    { id: '1', name: 'Chapter-1 PDF', file: null, uploadProgress: 0, isUploading: false }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const sampleBoards = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
  const sampleClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sampleSubjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Hindi', 'Computer Science'];
  const uploadTypes = ['Chapter Wise PDF', 'Single PDF'];


  const boardsList = async () => {
    const response = await getBoardsList();
    if (response && response.boards) {
      setBoards(response.boards);
    }
  }

  const classList = async () => {
    const response = await getClassesList();
    if (response && response.data) {
      setClasses(response.data);
    }
  }

  const subjectsList = async () => {
    const response = await getSubjectsList();
    if (response) {
      setSubjects(response);
    }
  }

  const saveBook = async (data) => {
    try {
      const response = await uploadEbook(data);
      if (response && response.message) {
        showSnackbar({
          title: "Success",
          description: `📃 ${response.message} ✅`,
          status: "success"
        });
      }
    }catch(error){
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    }
  }

  useEffect(() => {
    boardsList();
    classList();
    subjectsList();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (callback: (progress: number) => void): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          callback(progress);
          resolve();
        } else {
          callback(progress);
        }
      }, 200);
    });
  };

  const getBoardId = (data: string) => {
    const boardData = boards.find((val: any) => (val.name) == data);
    const boardId = boardData.id ? boardData.id : null;
    return boardId;
  }

  const getClassId = (data: string) => {
    const boardData = classes.find((val: any) => ('Class ' + val.class_number) == data);
    const boardId = boardData.id ? boardData.id : null;
    return boardId;
  }

  const getSubjectId = (data: string) => {
    const boardData = subjects.find((val: any) => (val.name) == data);
    const boardId = boardData.id ? boardData.id : null;
    return boardId;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field == 'board') {
      setFormData(prev => ({
        ...prev,
        board_id: getBoardId(value)
      }));
    } else if (field == 'class') {
      setFormData(prev => ({
        ...prev,
        'class_id': getClassId(value)
      }));
    } else if (field == 'subject') {
      setFormData(prev => ({
        ...prev,
        'subject_id': getSubjectId(value)
      }));
    } else if (field == 'uploadType') {
      setFormData(prev => ({
        ...prev,
        'upload_type': value == 'Single PDF' ? 'single' : 'multiple'
      }));
    }
    console.log(formData);
  };

  const handleContentPdfChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setContentPdf(file);
      formData[`file`] = file;
      setIsContentPdfUploading(true);
      setContentPdfProgress(0);

      await simulateUpload((progress) => {
        setContentPdfProgress(progress);
      });

      setIsContentPdfUploading(false);
    } else {
      // toast.error('Please select a valid PDF file');
      showSnackbar({
        title: "⛔ Error",
        description: `Please select a valid PDF file 📃`,
        status: "error"
      });
    }
  };

  const handleChapterFileChange = async (id: string, file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setChapterFiles(prev =>
        prev.map(chapter =>
          chapter.id === id
            ? { ...chapter, file, isUploading: true, uploadProgress: 0 }
            : chapter
        )
      );

      await simulateUpload((progress) => {
        setChapterFiles(prev =>
          prev.map(chapter =>
            chapter.id === id
              ? { ...chapter, uploadProgress: progress }
              : chapter
          )
        );
      });

      setChapterFiles(prev =>
        prev.map(chapter =>
          chapter.id === id
            ? { ...chapter, isUploading: false }
            : chapter
        )
      );
    } else if (file) {
      // toast.error('Please select a valid PDF file');
      showSnackbar({
        title: "⛔ Error",
        description: `Please select a valid PDF file 📃`,
        status: "error"
      });
    }
  };

  const removeContentPdf = () => {
    setContentPdf(null);
    setContentPdfProgress(0);
    setIsContentPdfUploading(false);
  };

  const removeChapterFile = (id: string) => {
    setChapterFiles(prev =>
      prev.map(chapter =>
        chapter.id === id
          ? { ...chapter, file: null, uploadProgress: 0, isUploading: false }
          : chapter
      )
    );
  };

  const addNewChapter = () => {
    const newId = (chapterFiles.length + 1).toString();
    setChapterFiles(prev => [...prev, {
      id: newId,
      name: `Chapter-${newId} PDF`,
      file: null,
      uploadProgress: 0,
      isUploading: false
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

    if(!formData[`file`]){
      formData[`file`] = contentPdf;
    }

    saveBook(formData);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      //toast.success('E-book uploaded successfully!');

      // Reset form
      setFormData({
        board: '',
        class: '',
        subject: '',
        uploadType: ''
      });
      setContentPdf(null);
      setContentPdfProgress(0);
      setIsContentPdfUploading(false);
      setChapterFiles([{ id: '1', name: 'Chapter-1 PDF', file: null, uploadProgress: 0, isUploading: false }]);
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
    setContentPdfProgress(0);
    setIsContentPdfUploading(false);
    setChapterFiles([{ id: '1', name: 'Chapter-1 PDF', file: null, uploadProgress: 0, isUploading: false }]);
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
                      {boards.map((board, index) => (
                        <SelectItem key={board.id} value={board.name}>{board.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                    <SelectTrigger >
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="h-64">
                      {classes.map((cls) => (
                        <SelectItem key={cls.class_id} value={'Class ' + cls.class_number}>{'Class ' + cls.class_number}</SelectItem>
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
                  <SelectContent className="h-64">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
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
                      disabled={isContentPdfUploading}
                    />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {contentPdf && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{contentPdf.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(contentPdf.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeContentPdf}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {(isContentPdfUploading || contentPdfProgress > 0) && (
                        <div className="space-y-1">
                          <Progress value={contentPdfProgress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {isContentPdfUploading ? `Uploading... ${Math.round(contentPdfProgress)}%` : 'Upload complete'}
                          </p>
                        </div>
                      )}
                    </div>
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
                          disabled={chapter.isUploading}
                        />
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      {chapter.file && (
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{chapter.file.name}</span>
                              <span className="text-xs text-gray-500">({formatFileSize(chapter.file.size)})</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChapterFile(chapter.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {(chapter.isUploading || chapter.uploadProgress > 0) && (
                            <div className="space-y-1">
                              <Progress value={chapter.uploadProgress} className="h-2" />
                              <p className="text-xs text-gray-500">
                                {chapter.isUploading ? `Uploading... ${Math.round(chapter.uploadProgress)}%` : 'Upload complete'}
                              </p>
                            </div>
                          )}
                        </div>
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
