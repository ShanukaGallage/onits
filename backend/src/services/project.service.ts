import { prisma, safeUserSelect } from '../config/db';

/**
 * Returns all projects including createdBy (with safeUserSelect) and members (with user using safeUserSelect).
 */
export async function getAllProjects() {
  return prisma.project.findMany({
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      members: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });
}

/**
 * Returns a single project by ID with createdBy and members (with user using safeUserSelect).
 * Throws an error if not found.
 */
export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      members: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
      tasks: {
        include: {
          assignments: {
            include: {
              user: {
                select: safeUserSelect,
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

/**
 * Creates a project and automatically adds the creator as a ProjectMember.
 * Returns the created project with createdBy and members (with user using safeUserSelect).
 */
export async function createProject(data: any, createdById: string, files?: Express.Multer.File[]) {
  let tags: string[] = [];
  try { tags = data.tags ? JSON.parse(data.tags) : []; } catch (e) {
    tags = typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : [];
  }

  let externalLinks: string[] = [];
  try { externalLinks = data.externalLinks ? JSON.parse(data.externalLinks) : []; } catch (e) {
    externalLinks = typeof data.externalLinks === 'string' ? data.externalLinks.split(',').map((l: string) => l.trim()) : [];
  }

  let coreTeamMemberIds: string[] = [];
  try { coreTeamMemberIds = data.coreTeamMemberIds ? JSON.parse(data.coreTeamMemberIds) : []; } catch (e) {
    coreTeamMemberIds = typeof data.coreTeamMemberIds === 'string' ? [data.coreTeamMemberIds] : [];
  }

  const memberData = [{ userId: createdById }];
  for (const uid of coreTeamMemberIds) {
    if (uid !== createdById) memberData.push({ userId: uid });
  }

  const attachmentsData = files?.map(f => ({
    fileName: f.originalname,
    fileUrl: `/uploads/projects/${f.filename}`,
    fileSize: f.size,
    fileType: f.mimetype,
    uploadedById: createdById,
  })) || [];

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      projectKey: data.projectKey,
      visibility: data.visibility || 'PUBLIC',
      colorCode: data.colorCode,
      tags,
      estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : null,
      externalLinks,
      createdById,
      members: { create: memberData },
      channels: {
        create: { name: `${data.name} General`, type: 'Project', createdById },
      },
      attachments: { create: attachmentsData }
    },
    include: {
      createdBy: { select: safeUserSelect },
      members: { include: { user: { select: safeUserSelect } } },
      attachments: true,
    },
  });
}

/**
 * Updates project details (name/description) and returns the project with createdBy and members.
 * Throws an error if not found.
 */
export async function updateProject(id: string, data: any, files?: Express.Multer.File[]) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Project not found');
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.projectKey !== undefined) updateData.projectKey = data.projectKey;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;
  if (data.colorCode !== undefined) updateData.colorCode = data.colorCode;
  if (data.status !== undefined) updateData.status = data.status;
  
  if (data.estimatedCompletionDate !== undefined) {
    updateData.estimatedCompletionDate = data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : null;
  }

  if (data.tags !== undefined) {
    try { updateData.tags = JSON.parse(data.tags); } catch (e) {
      updateData.tags = typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags;
    }
  }

  if (data.externalLinks !== undefined) {
    try { updateData.externalLinks = JSON.parse(data.externalLinks); } catch (e) {
      updateData.externalLinks = typeof data.externalLinks === 'string' ? data.externalLinks.split(',').map((l: string) => l.trim()) : data.externalLinks;
    }
  }

  const attachmentsData = files?.map(f => ({
    fileName: f.originalname,
    fileUrl: `/uploads/projects/${f.filename}`,
    fileSize: f.size,
    fileType: f.mimetype,
    uploadedById: existing.createdById,
  }));

  if (attachmentsData && attachmentsData.length > 0) {
    updateData.attachments = { create: attachmentsData };
  }

  return prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: { select: safeUserSelect },
      members: { include: { user: { select: safeUserSelect } } },
      attachments: true,
    },
  });
}

/**
 * Updates a project's status and returns the updated project with createdBy and members.
 * Throws an error if not found.
 */
export async function updateProjectStatus(id: string, status: any) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Project not found');
  }

  return prisma.project.update({
    where: { id },
    data: {
      status: status,
    },
    include: {
      createdBy: {
        select: safeUserSelect,
      },
      members: {
        include: {
          user: {
            select: safeUserSelect,
          },
        },
      },
    },
  });
}

/**
 * Deletes a project. Cascade delete handles tasks and project members.
 * Throws an error if not found.
 */
export async function deleteProject(id: string) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Project not found');
  }

  await prisma.project.delete({
    where: { id },
  });

  return { message: 'Project deleted successfully' };
}

/**
 * Adds a user as a member of a project.
 * Throws errors if the project, user, or membership does not exist or already exists.
 */
export async function addMember(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new Error('User is already a member of this project');
  }

  await prisma.projectMember.create({
    data: {
      projectId,
      userId,
    },
  });

  return getProjectById(projectId);
}

/**
 * Removes a member from a project.
 * Throws errors if the project or membership does not exist.
 */
export async function removeMember(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new Error('User is not a member of this project');
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return getProjectById(projectId);
}
