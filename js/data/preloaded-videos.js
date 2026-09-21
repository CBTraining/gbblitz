/**
 * GBblitz - Preloaded Usable Videos Dataset
 * Compact representation expanding to full video objects on load (saving >80% bandwidth).
 * Contains all validated Wave 1-5 videos for instant offline render.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.36.0';

function createVideo([fileId, title, designation, wave]) {
  return {
    id: 'drive-' + fileId,
    driveFileId: fileId,
    title: title,
    designation: designation,
    type: designation,
    wave: wave,
    category: wave,
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=s800',
    videoUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
    driveUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
    description: wave + (designation && !designation.toLowerCase().includes('approved') ? ' • ' + designation : '')
  };
}

const RAW_VIDEOS = [];

export const PRELOADED_VIDEOS = [];
