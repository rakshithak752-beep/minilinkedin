require('dotenv').config({ path: '../.env' });
const { admin } = require('./config/firebase');

async function enableAuth() {
  try {
    const projectConfigManager = admin.auth().projectConfigManager();
    await projectConfigManager.updateProjectConfig({
      signIn: {
        email: {
          enabled: true,
          passwordRequired: true
        }
      }
    });
    console.log('Successfully enabled Email/Password auth in Firebase!');
  } catch (err) {
    console.error('Error enabling auth:', err);
  }
}

enableAuth();
