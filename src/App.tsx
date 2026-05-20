// الجذر — يغلّف التطبيق بالمزوّدات

import type { FC } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';

import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';
import { OfflineBanner } from './components/OfflineBanner';
import { LargeTextEffect } from './components/LargeTextEffect';

// إعداد Ionic React
setupIonicReact({ mode: 'ios' });

const App: FC = () => (
  <IonApp>
    {/* شريط offline يظهر تلقائياً عند فقد الاتصال */}
    <OfflineBanner />
    <AuthProvider>
      <ProfileProvider>
        <LanguageProvider>
          <LargeTextEffect />
          <AppRoutes />
        </LanguageProvider>
      </ProfileProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
