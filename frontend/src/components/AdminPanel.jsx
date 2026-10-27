import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import PageShell from './ui/PageShell';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileCode,
  CheckCircle2,
  ListPlus,
  Layers,
  Send,
  Sparkles
} from 'lucide-react';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [activeCodeLangTab, setActiveCodeLangTab] = useState(0); // 0 = C++, 1 = Java, 2 = JS

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error creating problem: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const languages = ['C++', 'Java', 'JavaScript'];

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
            Create New Coding Challenge
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-base-content/60">
            Define problem metadata, judge test cases, and starter code templates.
          </p>
        </div>
        <NavLink
          to="/admin"
          className="btn btn-ghost btn-sm border border-base-300 gap-2 text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          Admin Hub
        </NavLink>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Metadata */}
        <div className="surface-card rounded-3xl p-6 sm:p-7 border-base-300">
          <div className="flex items-center gap-2 mb-4 border-b border-base-300/70 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers size={16} />
            </span>
            <h2 className="text-base font-bold text-base-content">1. Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Problem Title
                </span>
              </label>
              <input
                {...register('title')}
                placeholder="e.g. Two Sum, Valid Parentheses"
                className={`input input-bordered w-full text-sm bg-base-100 ${
                  errors.title ? 'input-error' : ''
                }`}
              />
              {errors.title && (
                <span className="text-error text-xs mt-1">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Detailed Description & Problem Statement
                </span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe the task, input formats, constraints, and problem statement clearly..."
                className={`textarea textarea-bordered h-36 text-sm bg-base-100 leading-relaxed font-sans ${
                  errors.description ? 'textarea-error' : ''
                }`}
              />
              {errors.description && (
                <span className="text-error text-xs mt-1">{errors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Difficulty Level
                  </span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered text-sm bg-base-100 ${
                    errors.difficulty ? 'select-error' : ''
                  }`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Topic / Algorithm Tag
                  </span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered text-sm bg-base-100 ${
                    errors.tags ? 'select-error' : ''
                  }`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP (Dynamic Programming)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Test Cases */}
        <div className="surface-card rounded-3xl p-6 sm:p-7 border-base-300">
          <div className="flex items-center gap-2 mb-4 border-b border-base-300/70 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <ListPlus size={16} />
            </span>
            <h2 className="text-base font-bold text-base-content">2. Judge Test Cases</h2>
          </div>

          {/* Visible Cases */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-base-content">
                  Visible Test Cases (Shown in Examples)
                </h3>
                <p className="text-xs text-base-content/50">
                  Displayed directly to candidates on the problem page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-xs btn-primary gap-1"
              >
                <Plus size={13} />
                Add Example Case
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-2xl border border-base-300/80 bg-base-100/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Example #{index + 1}</span>
                  {visibleFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    {...register(`visibleTestCases.${index}.input`)}
                    placeholder="Input (e.g. [2,7,11,15], target = 9)"
                    className="input input-bordered input-sm font-mono text-xs w-full bg-base-200/50"
                  />
                  <input
                    {...register(`visibleTestCases.${index}.output`)}
                    placeholder="Expected Output (e.g. [0,1])"
                    className="input input-bordered input-sm font-mono text-xs w-full bg-base-200/50"
                  />
                </div>

                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation of how the output was calculated..."
                  rows={2}
                  className="textarea textarea-bordered textarea-sm text-xs w-full bg-base-200/50"
                />
              </div>
            ))}
          </div>

          {/* Hidden Cases */}
          <div className="space-y-4 pt-4 border-t border-base-300/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-base-content">
                  Hidden Judge Test Cases
                </h3>
                <p className="text-xs text-base-content/50">
                  Used for evaluating official submissions in Judge0.
                </p>
              </div>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-xs btn-secondary gap-1"
              >
                <Plus size={13} />
                Add Hidden Case
              </button>
            </div>

            {hiddenFields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-2xl border border-base-300/80 bg-base-100/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary">
                    Hidden Test Case #{index + 1}
                  </span>
                  {hiddenFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    {...register(`hiddenTestCases.${index}.input`)}
                    placeholder="Hidden Standard Input"
                    className="input input-bordered input-sm font-mono text-xs w-full bg-base-200/50"
                  />
                  <input
                    {...register(`hiddenTestCases.${index}.output`)}
                    placeholder="Hidden Expected Output"
                    className="input input-bordered input-sm font-mono text-xs w-full bg-base-200/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Code Templates & Solutions */}
        <div className="surface-card rounded-3xl p-6 sm:p-7 border-base-300">
          <div className="flex items-center gap-2 mb-4 border-b border-base-300/70 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileCode size={16} />
            </span>
            <h2 className="text-base font-bold text-base-content">
              3. Starter Templates & Reference Solutions
            </h2>
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-base-300/70 pb-2">
            {languages.map((lang, idx) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveCodeLangTab(idx)}
                className={`btn btn-sm ${
                  activeCodeLangTab === idx
                    ? 'btn-primary'
                    : 'btn-ghost text-base-content/70 hover:text-base-content'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Render Active Language Code Inputs */}
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`space-y-4 ${activeCodeLangTab === index ? 'block' : 'hidden'}`}
            >
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Starter Code Template ({languages[index]})
                  </span>
                </label>
                <textarea
                  {...register(`startCode.${index}.initialCode`)}
                  rows={6}
                  placeholder={`// Enter starter code boilerplate for ${languages[index]}`}
                  className="textarea textarea-bordered font-mono text-xs bg-slate-950 text-slate-100 p-4 leading-relaxed w-full focus:border-primary"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Complete Reference Solution ({languages[index]})
                  </span>
                </label>
                <textarea
                  {...register(`referenceSolution.${index}.completeCode`)}
                  rows={7}
                  placeholder={`// Enter verified complete solution for ${languages[index]}`}
                  className="textarea textarea-bordered font-mono text-xs bg-slate-950 text-emerald-300 p-4 leading-relaxed w-full focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Form Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <NavLink to="/admin" className="btn btn-ghost btn-sm">
            Cancel
          </NavLink>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-sm px-6 font-semibold shadow-md shadow-primary/20 gap-2"
          >
            {submitting ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Publishing Problem...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Publish Challenge</span>
              </>
            )}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

export default AdminPanel;