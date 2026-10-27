import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import PageShell from './ui/PageShell';
import { ArrowLeft, UploadCloud, Video, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];

    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      // Step 1: Fetch Cloudinary signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Prepare FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Direct upload to Cloudinary with progress
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Persist metadata in MongoDB via backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please check your network and try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-xl">
        <NavLink
          to="/admin/video"
          className="btn btn-ghost btn-xs sm:btn-sm mb-4 gap-2 px-0 text-base-content/65 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Back to Video Inventory
        </NavLink>

        <div className="surface-card rounded-3xl border border-base-300 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-base-300/70 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Upload Video Editorial</h2>
              <p className="text-xs text-base-content/60">
                Attach an explanatory video solution to problem ID: {problemId}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Custom Styled File Input Dropzone */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Select MP4 or WebM video file (Max 100MB)
                </span>
              </label>

              <div className="rounded-2xl border-2 border-dashed border-base-300 p-6 text-center hover:border-primary/50 transition-colors bg-base-100">
                <input
                  type="file"
                  id="videoFileInput"
                  accept="video/*"
                  disabled={uploading}
                  {...register('videoFile', {
                    required: 'Please select a video file',
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) return 'Please select a video file';
                        const file = files[0];
                        return file.type.startsWith('video/') || 'Please select a valid video file';
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const file = files[0];
                        const maxSize = 100 * 1024 * 1024;
                        return file.size <= maxSize || 'File size exceeds maximum 100MB limit';
                      }
                    }
                  })}
                  className="hidden"
                />

                <label htmlFor="videoFileInput" className="cursor-pointer block">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-base-200 text-primary">
                    <Video size={24} />
                  </div>
                  <p className="text-sm font-semibold text-base-content">
                    {selectedFile ? selectedFile.name : 'Click to browse video file'}
                  </p>
                  <p className="mt-1 text-xs text-base-content/50">
                    MP4, WebM, MOV up to 100MB
                  </p>
                </label>
              </div>

              {errors.videoFile && (
                <span className="text-error text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} />
                  {errors.videoFile.message}
                </span>
              )}
            </div>

            {/* Selected File Details */}
            {selectedFile && !uploading && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-base-content animate-fade-in">
                <FileCheck size={18} className="text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{selectedFile.name}</p>
                  <p className="text-[11px] text-base-content/60">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}

            {/* Realtime Upload Progress Bar */}
            {uploading && (
              <div className="space-y-2 rounded-xl bg-base-200/50 p-4 animate-fade-in">
                <div className="flex justify-between text-xs font-semibold text-base-content">
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="loading loading-spinner loading-xs" />
                    Uploading to Cloudinary...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Success Card */}
            {uploadedVideo && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 animate-fade-in">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Video Successfully Uploaded & Saved!</p>
                  <p className="text-base-content/70">
                    Duration: {formatDuration(uploadedVideo.duration)}
                  </p>
                  <p className="text-base-content/70">
                    Published: {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <NavLink to="/admin/video" className="btn btn-ghost btn-sm">
                Cancel
              </NavLink>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn btn-primary btn-sm px-6 font-semibold shadow-md shadow-primary/20"
              >
                {uploading ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Uploading...
                  </>
                ) : (
                  'Start Upload'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

export default AdminUpload;