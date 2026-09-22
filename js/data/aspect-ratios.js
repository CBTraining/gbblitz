/**
 * GBblitz - Known Video Aspect Ratios Override Dictionary
 * Maps Google Drive File IDs to their calibrated aspect ratios (width / height).
 * 
 * - Portrait (Vertical / Reels / Shorts): aspect < 0.95 (e.g. 9:16 = 0.5625)
 * - Landscape (Widescreen / Standard): aspect >= 1.0 (e.g. 16:9 = 1.7778)
 * 
 * Newly identified portrait/landscape ratios can be declared here without altering gallery logic.
 */
export const KNOWN_ASPECT_RATIOS = {
  // Known portrait videos (aspect < 0.95)
  '10orpHS-vuqal8moH-Epjs89DswBaeFK_': 0.5625,
  '1un9shx6qb1r5hejoMlrJdF-fjmsEvFem': 0.5625,
  '1VGgwbRnIq05t8kejbpBGUGg5K4iWeeHi': 0.5625,
  '1RFugCmwfpIYwOr7zut4uz5i_QmO7ixyT': 0.5625,
  '1318HU8kWkJanx3u-VvkixXaOB2I94dx0': 0.5625,
  '1Gy0wZN-n4KpzdA_zgR4pOtDx_WxoVXSj': 0.5625,
  '132HVaunVpeKuyq1O86lVNFy2KGSSKeNb': 0.5625,
  '1qBNHic1OQ2ozPt8qCgbpXUXnR1Fn_Z9w': 0.5625,
  '1YQmw0x-fKhxncdlY9Mt-aHzYu5MrJGXX': 0.5625,
  '1FVaMjMwiF6l6L6BfotpkaRERlJF2Y4NO': 0.5625,
  '1FGp-A1TP9uun1E-HwWBuhi6rkVliEvC_': 0.5625,
  '1yex_GRwom3D4h12tU4YhMUpcFgdgiTS9': 0.8388,
  '1yl6q0Nxmiv57Pky72NWEaT6JsoLG0o-a': 0.5675,
  '1dKI1nsIEpujh_4-_Pezs0zgAUZTTRZwh': 0.5625,
  '1ZBsuBDs3ty1C6CL2aidBxaTJuWODELDb': 0.5625,

  // Prominent landscapes (1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF is 16:9 widescreen)
  '1KluNxVaagpuGBajxV-aPLiRTLZuJuCWF': 1.7778,
  '1V8w6gGmiFNtd_4ZN0NkQrvdEaKD89dcf': 1.6,
  '1u0_v1FjOAynwS0cH_vTN-kff2nz-VeX8': 1.7817,
  '1PSD2PvYXoH2tUxoV1K9kdmTpXN1jpQKp': 1.7778,
  '1dD7PDjqshOh_4-w2cLbuiRUyzt3Pn7nY': 1.7778,
  '19hvACWVY5b_ysk50aTTZf5pHGp7xvXT0': 1.7778
};
