import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  created: number;
  ports: string[];
}

export const listContainers = async (all = true): Promise<ContainerInfo[]> => {
  try {
    const containers = await docker.listContainers({ all });
    return containers.map((c) => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0]?.replace(/^\//, '') || 'unknown',
      image: c.Image,
      status: c.Status,
      state: c.State,
      created: c.Created,
      ports: c.Ports.map((p) =>
        p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}/${p.Type}` : `${p.PrivatePort}/${p.Type}`
      ),
    }));
  } catch (error) {
    console.error('Error listing containers:', error);
    throw new Error('Failed to list containers. Is Docker running?');
  }
};

export const startContainer = async (containerId: string): Promise<void> => {
  const container = docker.getContainer(containerId);
  await container.start();
};

export const stopContainer = async (containerId: string): Promise<void> => {
  const container = docker.getContainer(containerId);
  await container.stop();
};

export const restartContainer = async (containerId: string): Promise<void> => {
  const container = docker.getContainer(containerId);
  await container.restart();
};

export const getContainerLogs = async (
  containerId: string,
  tail = 100
): Promise<string> => {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  });
  return logs.toString('utf8');
};

export const pruneImages = async (): Promise<{ deleted: number; spaceReclaimed: number }> => {
  const result = await docker.pruneImages({ filters: { dangling: { true: true } } });
  return {
    deleted: result.ImagesDeleted?.length || 0,
    spaceReclaimed: result.SpaceReclaimed || 0,
  };
};

export const pruneSystem = async (): Promise<{
  containers: number;
  images: number;
  volumes: number;
  spaceReclaimed: number;
}> => {
  const [containers, images, volumes] = await Promise.all([
    docker.pruneContainers(),
    docker.pruneImages({ filters: { dangling: { true: true } } }),
    docker.pruneVolumes(),
  ]);

  return {
    containers: containers.ContainersDeleted?.length || 0,
    images: images.ImagesDeleted?.length || 0,
    volumes: volumes.VolumesDeleted?.length || 0,
    spaceReclaimed:
      (containers.SpaceReclaimed || 0) +
      (images.SpaceReclaimed || 0) +
      (volumes.SpaceReclaimed || 0),
  };
};

export const getDockerInfo = async (): Promise<{
  version: string;
  containers: number;
  images: number;
  running: number;
}> => {
  try {
    const [info, version] = await Promise.all([docker.info(), docker.version()]);
    return {
      version: version.Version,
      containers: info.Containers,
      images: info.Images,
      running: info.ContainersRunning,
    };
  } catch {
    return {
      version: 'N/A',
      containers: 0,
      images: 0,
      running: 0,
    };
  }
};
