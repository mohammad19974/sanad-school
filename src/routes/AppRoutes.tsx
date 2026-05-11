// التوجيه الرئيسي — auth، tabs، صفحات الألعاب

import type { FC } from 'react';
import { IonReactRouter } from '@ionic/react-router';
import {
  IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonLabel,
} from '@ionic/react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { CalmPage } from '../pages/CalmPage';
import { ContactPage } from '../pages/ContactPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SnakeGamePage } from '../pages/games/SnakeGamePage';
import { MemoryGamePage } from '../pages/games/MemoryGamePage';

import { Icon } from '../ui/Icon';
import { colors, fontFamily } from '../theme/tokens';

const Tabs: FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/home"    component={HomePage} />
      <Route exact path="/tabs/map"     component={MapPage} />
      <Route exact path="/tabs/calm"    component={CalmPage} />
      <Route exact path="/tabs/contact" component={ContactPage} />
      <Route exact path="/tabs/profile" component={ProfilePage} />
      <Route exact path="/tabs"><Redirect to="/tabs/home" /></Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom" style={{ '--background': colors.bgCard, fontFamily }}>
      <IonTabButton tab="home" href="/tabs/home">
        <Icon name="shield" size={22} />
        <IonLabel>الرئيسية</IonLabel>
      </IonTabButton>
      <IonTabButton tab="map" href="/tabs/map">
        <Icon name="map" size={22} />
        <IonLabel>الخريطة</IonLabel>
      </IonTabButton>
      <IonTabButton tab="calm" href="/tabs/calm">
        <Icon name="calm" size={22} />
        <IonLabel>تهدئة</IonLabel>
      </IonTabButton>
      <IonTabButton tab="contact" href="/tabs/contact">
        <Icon name="phone" size={22} />
        <IonLabel>تواصل</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/tabs/profile">
        <Icon name="user" size={22} />
        <IonLabel>حسابي</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export const AppRoutes: FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colors.bg, color: colors.primary, fontFamily, fontSize: 14,
      }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Switch>
          {/* auth */}
          <Route exact path="/auth/login" component={LoginPage} />
          <Route exact path="/auth/otp"   component={OtpPage} />

          {/* الألعاب — يحتاج المستخدم تسجيل الدخول */}
          <Route exact path="/games/snake">
            {user ? <SnakeGamePage /> : <Redirect to="/auth/login" />}
          </Route>
          <Route exact path="/games/memory">
            {user ? <MemoryGamePage /> : <Redirect to="/auth/login" />}
          </Route>

          {/* tabs الرئيسية */}
          <Route path="/tabs">
            {user ? <Tabs /> : <Redirect to="/auth/login" />}
          </Route>

          {/* الافتراضي */}
          <Route exact path="/">
            <Redirect to={user ? '/tabs/home' : '/auth/login'} />
          </Route>
        </Switch>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};
