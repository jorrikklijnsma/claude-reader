import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FileUpload from '../components/ui/FileUpload';
import {
  IoCloudUploadOutline,
  IoFolderOutline,
  IoSearchOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5';
import { formatDate } from '../utils/formatters';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loadProjects } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // If no projects data is loaded, redirect to the home page
  useEffect(() => {
    if (!data.projects && !data.isLoading) {
      navigate('/');
    }
  }, [data.projects, data.isLoading, navigate]);

  // Filter projects by search term
  const filteredProjects = React.useMemo(() => {
    if (!data.projects) return [];

    if (searchTerm.trim() === '') {
      return data.projects;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.projects.filter(
      project =>
        // Search in project name
        (project.name && project.name.toLowerCase().includes(lowerSearchTerm)) ||
        // Search in project description
        (project.description && project.description.toLowerCase().includes(lowerSearchTerm)) ||
        // Search in project docs
        project.docs.some(
          doc =>
            (doc.filename && doc.filename.toLowerCase().includes(lowerSearchTerm)) ||
            (doc.content && doc.content.toLowerCase().includes(lowerSearchTerm))
        )
    );
  }, [data.projects, searchTerm]);

  // Get current selected project
  const currentProject = selectedProject
    ? filteredProjects.find(p => p.uuid === selectedProject)
    : null;

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data.projects) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <IoCloudUploadOutline className="mx-auto mb-4 text-5xl text-purple-500" />
        <h2 className="mb-2 text-2xl font-bold">No Projects Loaded</h2>
        <p className="mb-6 text-gray-600">
          Please upload your projects.json file to view your Claude projects.
        </p>
        <div className="mx-auto max-w-md">
          <FileUpload onUpload={loadProjects} label="Upload projects.json" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Projects</h1>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="relative">
          <IoSearchOutline className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name, description, or document content..."
            className="w-full rounded-md border p-2 pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProjects.length !== data.projects.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredProjects.length} of {data.projects.length} projects
            {searchTerm && (
              <button
                className="ml-2 text-purple-600 hover:underline"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-2 text-xl font-bold">No Projects Found</h2>
          <p className="text-gray-600">
            {searchTerm
              ? 'No projects match your search criteria.'
              : 'There are no projects in the loaded file.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Projects list */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow-md">
              <div className="border-b bg-gray-50 p-4">
                <h2 className="font-medium">Projects ({filteredProjects.length})</h2>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {filteredProjects.map(project => (
                  <div
                    key={project.uuid}
                    className={`cursor-pointer border-b p-4 hover:bg-gray-50 ${
                      selectedProject === project.uuid ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProject(project.uuid)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-green-100 p-2">
                        <IoFolderOutline className="text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium" title={project.name}>
                          {project.name || 'Untitled Project'}
                        </h3>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {project.docs.length} document{project.docs.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="mr-2">
                            Created: {formatDate(new Date(project.created_at))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="lg:col-span-2">
            {currentProject ? (
              <div className="rounded-lg bg-white shadow-md">
                <div className="border-b p-6">
                  <h2 className="text-xl font-bold">{currentProject.name || 'Untitled Project'}</h2>

                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <div className="mr-4">
                      Created: {new Date(currentProject.created_at).toLocaleDateString()}
                    </div>
                    <div>Updated: {new Date(currentProject.updated_at).toLocaleDateString()}</div>
                  </div>

                  {currentProject.description && (
                    <div className="mt-4 text-gray-700">
                      <p>{currentProject.description}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center">
                    <span className="mr-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                      {currentProject.is_private ? 'Private' : 'Public'}
                    </span>

                    {currentProject.is_starter_project && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                        Starter Project
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-4 font-medium">Documents ({currentProject.docs.length})</h3>

                  {currentProject.docs.length === 0 ? (
                    <p className="text-gray-500">No documents in this project.</p>
                  ) : (
                    <div className="space-y-4">
                      {currentProject.docs.map(doc => (
                        <div key={doc.uuid} className="rounded-lg border p-4">
                          <div className="flex items-start">
                            <div className="mr-3 rounded-full bg-blue-100 p-2">
                              <IoDocumentTextOutline className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{doc.filename}</h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Created: {new Date(doc.created_at).toLocaleDateString()}
                              </p>

                              {doc.content && (
                                <div className="mt-3">
                                  <h5 className="mb-2 text-sm font-medium">Content:</h5>
                                  <div className="rounded border bg-gray-50 p-3 font-mono text-sm whitespace-pre-wrap">
                                    {doc.content.length > 500
                                      ? `${doc.content.substring(0, 500)}...`
                                      : doc.content}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow-md">
                <IoFolderOutline className="mx-auto mb-3 text-5xl text-gray-400" />
                <h3 className="mb-2 text-xl font-medium">No Project Selected</h3>
                <p className="text-gray-600">
                  Please select a project from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
