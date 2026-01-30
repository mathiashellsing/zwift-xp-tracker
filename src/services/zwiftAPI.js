/**
 * Zwift API Client
 * Fetches user data and XP from Zwift
 */

import { getAccessToken } from './zwiftAuth';

const ZWIFT_API_BASE = 'https://www.zwift.com/api/v3';

/**
 * Fetch user profile from Zwift API
 */
export async function fetchUserProfile() {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${ZWIFT_API_BASE}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - token may be invalid');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * Fetch player stats (XP, level, etc.)
 */
export async function fetchPlayerStats(playerId) {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${ZWIFT_API_BASE}/player/${playerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - token may be invalid');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch player stats for ${playerId}:`, error);
    throw error;
  }
}

/**
 * Fetch player achievements/unlockables
 */
export async function fetchPlayerAchievements(playerId) {
  const accessToken = await getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${ZWIFT_API_BASE}/player/${playerId}/achievements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - token may be invalid');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch achievements for ${playerId}:`, error);
    throw error;
  }
}

/**
 * Fetch current user XP
 * This is the main function you'll use to get XP data
 */
export async function fetchCurrentXP() {
  try {
    // First get profile to get user ID
    const profile = await fetchUserProfile();
    const userId = profile.id;
    
    // Then get player stats to get XP
    const stats = await fetchPlayerStats(userId);
    
    return {
      userId: userId,
      xp: stats.totalXp || 0,
      level: stats.level || 0,
      profile: profile,
      stats: stats,
    };
  } catch (error) {
    console.error('Failed to fetch current XP:', error);
    throw error;
  }
}

/**
 * Fetch unlocked items/achievements
 */
export async function fetchUnlockedItems(playerId) {
  try {
    const achievements = await fetchPlayerAchievements(playerId);
    
    // Transform achievements into unlocked items
    // The structure depends on Zwift API response format
    return achievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      unlockedAt: achievement.unlockedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch unlocked items:', error);
    throw error;
  }
}
