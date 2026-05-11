// الجذر — يغلّف التطبيق بالمزوّدات

import type { FC } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';

import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { AppRoutes } from './routes/AppRoutes';

// إعداد Ionic React
setupIonicReact({ mode: 'ios' });

const App: FC = () => (
  <IonApp>
    <AuthProvider>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
