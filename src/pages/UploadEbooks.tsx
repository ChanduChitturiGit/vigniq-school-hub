
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Upload, Plus, X, FileText, Loader2 } from 'lucide-react';
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
  inputKey: Number,
}

const UploadEbooks: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    board: '',
    class: '',
    subject: '',
    uploadType: '',
    chapter: '',
    yearString: '',
    year: null,
    inputKey: Date.now(),
    apply_to_all_schools: false
  });
  const [contentPdf, setContentPdf] = useState<File | null>(null);
  const [contentPdfProgress, setContentPdfProgress] = useState(0);
  const [isContentPdfUploading, setIsContentPdfUploading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [chapterFiles, setChapterFiles] = useState<ChapterFile[]>([
    { id: '1', name: 'Upload PDF', file: null, uploadProgress: 0, isUploading: false, inputKey: Date.now() }
  ]);
  const [savedFiles, setSavedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [chapterStatus, setChapterStatus] = useState(false);

  const sampleBoards = ['CBSE', 'ICSE', 'State Board', 'IGCSE', 'IB'];
  const sampleClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sampleSubjects = ['Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Hindi', 'Computer Science'];
  const uploadTypes = ['Chapter Wise PDF', 'Single PDF'];

  const [numberList, setNumberList] = useState(Array.from({ length: 25 }, (_, i) => i + 1));
  const [chapterListData, setChapterListData] = useState([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());



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

  useEffect(() => {
    boardsList();
    classList();
    subjectsList();
  }, []);

  // useEffect(() => {
  //   if (formData.uploadType == 'Chapter Wise PDF') {
  //     setTimeout(() => {
  //       bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     }, 300);
  //   }
  // }, [savedFiles, chapterFiles]);

  useEffect(() => {
    if (formData.uploadType == 'Chapter Wise PDF') {
      const newList = numberList.filter((num) => !chapterListData.includes(num));
      setNumberList(newList)
    }
  }, [chapterListData]);

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
        'upload_type': value == 'Single PDF' ? 'single' : 'chapter_wise'
      }));
    } else if (field == 'chapter') {
      setFormData(prev => ({
        ...prev,
        'chapter_number': value.split(' ')[1] || null
      }));
    } else if (field == 'yearString') {
      setFormData(prev => ({
        ...prev,
        'year': Number(value)
      }));
    }
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
      showSnackbar({
        title: "⛔ Error",
        description: `Please select a valid PDF file`,
        status: "error"
      });
    }
  };

  const handleChapterFileChange = async (id: string, file: File | null) => {
    if (file && file.type === 'application/pdf') {
      formData[`file`] = file;
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
      showSnackbar({
        title: "⛔ Error",
        description: `Please select a valid PDF file`,
        status: "error"
      });
    }
  };

  const removeContentPdf = () => {
    setFormData((prev) => ({
      ...prev,
      inputKey: Date.now()
    }))
    setContentPdf(null);
    setContentPdfProgress(0);
    setIsContentPdfUploading(false);
  };

  const removeChapterFile = (id: string) => {
    setChapterFiles(prev =>
      prev.map(chapter =>
        chapter.id === id
          ? {
            ...chapter,
            file: null,
            inputKey: Date.now(),
          }
          : chapter
      )
    );
  };

  const addNewChapter = () => {
    const newId = (chapterFiles.length + 1).toString();
    setChapterFiles(prev => [...prev, {
      id: newId,
      name: `Upload PDF`,
      file: null,
      uploadProgress: 0,
      isUploading: false,
      inputKey: Date.now()
    }]);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  };

  const removeChapter = (id: string) => {
    if (chapterFiles.length > 1) {
      setChapterFiles(prev => prev.filter(chapter => chapter.id !== id));
    }
  };

  const saveBook = async (data) => {
    try {
      const response = await uploadEbook(data);
      if (response && response.message) {
        savedFiles.push({ ...formData });
        setChapterFiles([
        ]);
        setChapterListData(prev => [...prev, Number(formData?.chapter?.split(' ')[1])]);
        showSnackbar({
          title: "Success",
          description: `${response.message} ✅`,
          status: "success"
        });
        if (formData.uploadType != 'Chapter Wise PDF') {
          setFormData({
            board: '',
            class: '',
            subject: '',
            uploadType: '',
            chapter: '',
            yearString: '',
            year: null,
            inputKey: Date.now(),
            apply_to_all_schools: false
          });
          setChapterStatus(false);
        } else {
          setFormData((prev) => ({
            ...prev,
            chapter: null
          }))
        }
        setContentPdf(null);
        setContentPdfProgress(0);
        setIsContentPdfUploading(false);
        setChapterStatus(true);
        // setChapterFiles([{ id: '1', name: 'Chapter-1 PDF', file: null, uploadProgress: 0, isUploading: false }]);
      }
    } catch (error) {
      showSnackbar({
        title: "⛔ Error",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error"
      });
    } finally {
      setIsUploading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.board || !formData.class || !formData.subject || !formData.uploadType) {
      showSnackbar({
        title: "⛔ Fields missing",
        description: `Please fill in all required fields`,
        status: "error"
      });
      return;
    }

    if (formData.uploadType === 'Chapter Wise PDF') {
      const hasFiles = chapterFiles.some(chapter => chapter.file);
      if (!hasFiles) {
        showSnackbar({
          title: "⛔ Error",
          description: `Please upload at least one chapter PDF`,
          status: "error"
        });
        return;
      }
    } else if (formData.uploadType === 'Single PDF' && !contentPdf) {
      showSnackbar({
        title: "⛔ Error",
        description: `Please upload the content PDF`,
        status: "error"
      });
      return;
    }

    setIsUploading(true);

    if (!formData[`file`]) {
      formData[`file`] = contentPdf;
    }

    saveBook(formData);
  };

  const handleCancel = () => {
    setFormData({
      board: '',
      class: '',
      subject: '',
      uploadType: '',
      chapter: '',
      yearString: '',
      year: null,
      inputKey: Date.now(),
      apply_to_all_schools: false
    });
    setContentPdf(null);
    setContentPdfProgress(0);
    setIsContentPdfUploading(false);
    setNumberList(Array.from({ length: 20 }, (_, i) => i + 1));
    setChapterListData([]);
    setChapterFiles([{ id: '1', name: '', file: null, uploadProgress: 0, isUploading: false, inputKey: Date.now() }]);
    setSavedFiles([]);
  };

  return (
    <>
      <MainLayout ref={bottomRef} pageTitle="Upload E-books">
        <div className="p-6">
          {/* <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Upload E-books</h1>
            <p className="text-gray-600 mt-2">Upload educational materials for students</p>
          </div> */}

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
                    <Select required value={formData.board} onValueChange={(value) => handleInputChange('board', value)}>
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
                    <Select required value={formData.class} onValueChange={(value) => handleInputChange('class', value)}
                      disabled={
                        !formData.board
                      }
                    >
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Select required value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}
                      disabled={
                        !formData.board ||
                        !formData.class
                      }
                    >
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

                  {/* year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <Select value={formData.yearString} onValueChange={(value) => handleInputChange('yearString', value)}
                      disabled={
                        !formData.board ||
                        !formData.class ||
                        !formData.subject
                      }>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a year" />
                      </SelectTrigger>
                      <SelectContent className='h-64'>
                        {years.map((val, index) => (
                          <SelectItem key={index} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>


                {/* Upload Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ebook Upload Type</label>
                  <Select required value={formData.uploadType} onValueChange={(value) => handleInputChange('uploadType', value)}
                    disabled={
                      !formData.board ||
                      !formData.class ||
                      !formData.yearString ||
                      !formData.subject
                    }
                  >
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

                {formData.uploadType === 'Chapter Wise PDF' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Number</label>
                    <Select required
                      value={formData.chapter} // Ensure it's a string
                      onValueChange={(value) => handleInputChange('chapter', value)} // Convert back to number
                      disabled={
                        !formData.board ||
                        !formData.class ||
                        !formData.yearString ||
                        !formData.subject ||
                        !formData.uploadType
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter number" />
                      </SelectTrigger>
                      <SelectContent className='h-64'>
                        {numberList.map((num) => (
                          <SelectItem key={'chapter ' + num} value={'chapter ' + num}>
                            {'chapter ' + num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Conditional File Upload Sections */}
                {formData.uploadType === 'Single PDF' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content PDF</label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf"
                        key={formData.inputKey.toString()}
                        onChange={handleContentPdfChange}
                        className="pl-10"
                        //disabled={isContentPdfUploading}
                        disabled={
                          (
                            !formData.board ||
                            !formData.class ||
                            !formData.yearString ||
                            !formData.subject ||
                            !formData.uploadType) &&
                          (isContentPdfUploading)
                        }
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    {contentPdf && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{contentPdf.name}</span>
                            {/* <span className="text-xs text-gray-500">({formatFileSize(contentPdf.size)})</span> */}
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
                        {/* {(isContentPdfUploading || contentPdfProgress > 0) && (
                        <div className="space-y-1">
                          <Progress value={contentPdfProgress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {isContentPdfUploading ? `Uploading... ${Math.round(contentPdfProgress)}%` : 'Upload complete'}
                          </p>
                        </div>
                      )} */}
                      </div>
                    )}
                  </div>
                )}

                {formData.uploadType === 'Chapter Wise PDF' && (
                  <>
                    <div className="space-y-4">
                      {savedFiles && savedFiles.length > 0 && savedFiles.map((val) => (
                        <div key={val.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">{val.chapter}</h4>
                          </div>
                          {val.file && (
                            <div className="mt-3 p-3 bg-white rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">{val.chapter}</span>
                                  {/* <span className="text-xs text-gray-500">({formatFileSize(chapter.file.size)})</span> */}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {chapterFiles && chapterFiles.length > 0 && chapterFiles.map((chapter) => (
                        <div key={chapter.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">{formData.chapter}</h4>
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
                            <Input required
                              type="file"
                              accept=".pdf"
                              key={chapter.inputKey.toString()}
                              onChange={(e) => handleChapterFileChange(chapter.id, e.target.files?.[0] || null)}
                              className="pl-10"
                              disabled={
                                (
                                  !formData.board ||
                                  !formData.class ||
                                  !formData.yearString ||
                                  !formData.subject ||
                                  !formData.uploadType ||
                                  !formData.chapter
                                )
                              }
                            />
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                          {chapter.file && (
                            <div className="mt-3 p-3 bg-white rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">{formData.chapter}</span>
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
                              {/* {(chapter.isUploading || chapter.uploadProgress > 0) && (
                            <div className="space-y-1">
                              <Progress value={chapter.uploadProgress} className="h-2" />
                              <p className="text-xs text-gray-500">
                                {chapter.isUploading ? `Uploading... ${Math.round(chapter.uploadProgress)}%` : 'Upload complete'}
                              </p>
                            </div>
                          )} */}
                            </div>
                          )}
                        </div>
                      ))}

                      {chapterFiles && chapterFiles.length == 0 &&
                        chapterStatus && formData.uploadType == 'Chapter Wise PDF' &&
                        (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addNewChapter}
                              className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Chapter
                            </Button>
                          </>
                        )
                      }
                    </div>
                  </>
                )}

                {/* check box */}
                {/* <div>
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={formData.apply_to_all_schools}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            apply_to_all_schools: true
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            apply_to_all_schools: false
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="sameAddress" className="text-sm text-gray-700">
                      Upload to all schools
                    </label>
                </div> */}

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
                        <Loader2 className="w-10 h-10 mx-auto text-blue animate-spin" />
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
      </MainLayout >
      {
        isUploading && (
          <SpinnerOverlay />
        )
      }
    </>
  );
};

export default UploadEbooks;
