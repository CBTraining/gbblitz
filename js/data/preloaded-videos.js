/**
 * GBblitz - Preloaded Usable Videos Dataset
 * Compact representation expanding to full video objects on load (saving >80% bandwidth).
 * Contains all validated Wave 1-5 videos for instant offline render.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.22.0';

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

const RAW_VIDEOS = [
  ["1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF", "Gemini Magic: From Smart Home Hacks to Creative Canvas Masterpieces", "Approved", "Wave 1"],
  ["1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8", "Unlocking Creative Brilliance with Gemini Canvas and the Nano Banana Hunt", "Approved", "Wave 1"],
  ["1un9shx6qb1r5hejoMlrJdF-fjmsEvFem", "Unlocking Creativity: Exploring Google Gemini's Game-Changing Canvas Feature", "Approved", "Wave 1"],
  ["1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp", "Unleashing the Magic: How Google Gemini Rewrote My Smart Home Routine", "Approved", "Wave 1"],
  ["1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY", "Unleashing Gemini: From Backyard Barbecues to Smart Kitchen Hacks", "Highlighted", "Wave 1"],
  ["1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf", "Unlocking Tomorrow: How Google Gemini Rewrites the Rules of Everyday Magic", "Highlighted", "Wave 1"],
  ["19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0", "Gemini in Action: From Canvas Masterpieces to Nano Bananas and Beyond", "Highlighted", "Wave 1"]
];

export const PRELOADED_VIDEOS = RAW_VIDEOS.map(createVideo).filter(v => isUsableDesignation(v.designation));
