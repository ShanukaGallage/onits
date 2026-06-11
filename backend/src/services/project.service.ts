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
export async function createProject(data: { name: string; description?: string }, createdById: string) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      createdById,
      members: {
        create: {
          userId: createdById,
        },
      },
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
 * Updates project details (name/description) and returns the project with createdBy and members.
 * Throws an error if not found.
 */
export async function updateProject(id: string, data: { name?: string; description?: string }) {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Project not found');
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
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
