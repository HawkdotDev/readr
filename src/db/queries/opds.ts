import { eq } from 'drizzle-orm';
import { getDatabase } from '../client';
import { opdsServers } from '../schema';
import { OPDSServer } from '../../types';

export const DEFAULT_OPDS_SERVERS: OPDSServer[] = [
  {
    id: 'opds_standard_ebooks',
    title: 'Standard Ebooks',
    url: 'https://standardebooks.org/opds/all',
    icon: 'book-open',
    createdAt: new Date(),
  },
  {
    id: 'opds_gutenberg',
    title: 'Project Gutenberg',
    url: 'https://m.gutenberg.org/ebooks.opds/',
    icon: 'globe',
    createdAt: new Date(),
  },
  {
    id: 'opds_feedbooks',
    title: 'Feedbooks Public Domain',
    url: 'https://catalog.feedbooks.com/publicdomain/browse/top.atom',
    icon: 'compass',
    createdAt: new Date(),
  },
];

export async function getAllOPDSServers(): Promise<OPDSServer[]> {
  try {
    const { db } = await getDatabase();
    if (!db) return DEFAULT_OPDS_SERVERS;

    const rows = await db.select().from(opdsServers).all();
    if (!rows || rows.length === 0) {
      // Seed default servers
      for (const s of DEFAULT_OPDS_SERVERS) {
        await db.insert(opdsServers).values({
          id: s.id,
          title: s.title,
          url: s.url,
          icon: s.icon,
        }).onConflictDoNothing().run();
      }
      return DEFAULT_OPDS_SERVERS;
    }

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      username: r.username,
      password: r.password,
      icon: r.icon,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.warn('Failed to load OPDS servers:', error);
    return DEFAULT_OPDS_SERVERS;
  }
}

export async function saveOPDSServer(server: {
  id?: string;
  title: string;
  url: string;
  username?: string | null;
  password?: string | null;
  icon?: string | null;
}): Promise<OPDSServer> {
  const { db } = await getDatabase();
  const id = server.id || `opds_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const newServer: OPDSServer = {
    id,
    title: server.title.trim(),
    url: server.url.trim(),
    username: server.username || null,
    password: server.password || null,
    icon: server.icon || 'server',
    createdAt: now,
  };

  if (db) {
    await db
      .insert(opdsServers)
      .values({
        id: newServer.id,
        title: newServer.title,
        url: newServer.url,
        username: newServer.username,
        password: newServer.password,
        icon: newServer.icon,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: opdsServers.id,
        set: {
          title: newServer.title,
          url: newServer.url,
          username: newServer.username,
          password: newServer.password,
          icon: newServer.icon,
        },
      })
      .run();
  }

  return newServer;
}

export async function deleteOPDSServer(id: string): Promise<void> {
  try {
    const { db } = await getDatabase();
    if (!db) return;
    await db.delete(opdsServers).where(eq(opdsServers.id, id)).run();
  } catch (error) {
    console.warn('Failed to delete OPDS server:', error);
  }
}
