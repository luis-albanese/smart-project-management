import { NextResponse } from 'next/server';
import { initializeDatabase, userQueries, projectQueries } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Verificar que la base de datos esté disponible
    await initializeDatabase();
    
    // Obtener estadísticas básicas
    const users = await userQueries.getAll();
    const projects = await projectQueries.getAll();
    
    // Verificar ruta de la base de datos
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/database.json'
      : path.join(process.cwd(), 'database.json');
    
    const dbExists = fs.existsSync(dbPath);
    const dbStats = dbExists ? fs.statSync(dbPath) : null;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        path: dbPath,
        exists: dbExists,
        size: dbStats ? `${(dbStats.size / 1024).toFixed(2)} KB` : 'N/A',
        lastModified: dbStats ? dbStats.mtime.toISOString() : 'N/A',
        usersCount: users.length,
        projectsCount: projects.length
      },
      uptime: process.uptime(),
      memory: {
        used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
} 