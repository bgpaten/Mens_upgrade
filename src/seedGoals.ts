// import { auth } from './lib/firebase';
// import { seedDefaultGoals } from './lib/seed_data';

/**
 * 🚀 Seed Default Goals Script
 * 
 * This script seeds the default goals (Subuh, Deep Work, etc.) to your Firestore account.
 * 
 * HOW TO USE:
 * 1. Start the app with `npm run dev`
 * 2. Sign up / Log in to your account
 * 3. Run this script in the browser console:
 * 
 *    import { seedDefaultGoals } from './src/lib/seed_data';
 *    import { auth } from './src/lib/firebase';
 *    seedDefaultGoals(auth.currentUser.uid);
 * 
 * OR call it programmatically during onboarding.
 */

async function runSeed() {
    /* 
    const user = auth.currentUser;
    
    if (!user) {
        console.error('❌ No user logged in. Please log in first.');
        return;
    }
    
    console.log('🌱 Seeding default goals for user:', user.uid);
    
    try {
        await seedDefaultGoals(user.uid);
        console.log('✅ Default goals seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding goals:', error);
    }
    */
    console.warn('runSeed is deprecated (Firebase legacy)');
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
    console.log('To seed goals, run: runSeed()');
    (window as any).runSeed = runSeed;
}

export { runSeed };
