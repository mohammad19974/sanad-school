// التوجيه الرئيسي — auth، tabs الطالب، tabs المنسّق، صفحات الألعاب
// التوجيه يعتمد على دور المستخدم

import type { FC } from 'react';
import { IonReactRouter } from '@ionic/react-router';
import {
  IonRouterOutlet, IonTabs, IonTabBar, IonTabButton,
  IonLabel,
} from '@ionic/react';
// ⚠️ ملاحظة مهمّة من وثائق Ionic:
// "Switch will not function as expected inside IonRouterOutlet"
// IonRouterOutlet يتولّى مهمّة اختيار الـ Route المُطابقة (سلوك Switch-like مبنيّ بداخله).
// لذا لا نستخدم <Switch> هنا — Routes توضع مباشرة كأبناء لـ IonRouterOutlet.
import { Route, Redirect, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useProfileContext } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useChatThreads } from '../hooks/useChatThreads';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { SplashScreen } from '../components/SplashScreen';
import { useOnboarding } from '../hooks/useOnboarding';
import { HomePage } from '../pages/HomePage';
import { MapPage } from '../pages/MapPage';
import { CalmPage } from '../pages/CalmPage';
import { ContactPage } from '../pages/ContactPage';
import { ProfilePage } from '../pages/ProfilePage';
import { StudentChatPage } from '../pages/StudentChatPage';
import { StudentChatListPage } from '../pages/StudentChatListPage';
import { SmsLogPage } from '../pages/SmsLogPage';
import { MedicalCardPage } from '../pages/MedicalCardPage';
import { PublicMedicalCardPage } from '../pages/PublicMedicalCardPage';
import { SnakeGamePage } from '../pages/games/SnakeGamePage';
import { MemoryGamePage } from '../pages/games/MemoryGamePage';
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { StaffSOSDetailPage } from '../pages/staff/StaffSOSDetailPage';
import { StaffChatPage } from '../pages/staff/StaffChatPage';
import { ChatListPage } from '../pages/staff/ChatListPage';
import { StaffProfilePage } from '../pages/staff/StaffProfilePage';

import { Icon, type IconName } from '../ui/Icon';
import { colors, fontFamily } from '../theme/tokens';

// ════════════════════════════════════════════════════
// تابات الطالب
// ════════════════════════════════════════════════════

import type { TranslationKey } from '../i18n/translations';

const STUDENT_TABS: { id: string; labelKey: TranslationKey; icon: IconName; href: string }[] = [
  { id: 'home',    labelKey: 'tab.home',    icon: 'shield', href: '/tabs/home' },
  { id: 'map',     labelKey: 'tab.map',     icon: 'map',    href: '/tabs/map' },
  { id: 'calm',    labelKey: 'tab.calm',    icon: 'calm',   href: '/tabs/calm' },
  { id: 'contact', labelKey: 'tab.contact', icon: 'phone',  href: '/tabs/contact' },
  { id: 'profile', labelKey: 'tab.profile', icon: 'user',   href: '/tabs/profile' },
];

// خريطة المسارات الفرعيّة → التاب الذي يبقى مُحدَّداً
// مثال: /staff/sos/abc → tab "dashboard" (لأن المستخدم جاء من Dashboard)
const NESTED_TAB_PREFIXES: Record<string, string> = {
  '/staff/sos/':   'dashboard',
  '/staff/chats/': 'chats',
};

const tabFromPath = (path: string, prefix: string): string => {
  // أولاً: المسارات الفرعيّة المعروفة (مثل /staff/sos/:id)
  for (const [pfx, tab] of Object.entries(NESTED_TAB_PREFIXES)) {
    if (path.startsWith(pfx)) return tab;
  }
  // ثانياً: المقطع الأوّل بعد الـ prefix
  const re = new RegExp(`^${prefix}/([^/]+)`);
  const m = path.match(re);
  return m ? m[1] : '';
};

const StudentTabBar: FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const selected = tabFromPath(location.pathname, '/tabs') || 'home';
  return (
    <IonTabBar
      slot="bottom"
      selectedTab={selected}
      style={{
        '--background': colors.bgCard,
        '--color': colors.textLight,
        '--color-selected': colors.primary,
        fontFamily,
      }}
    >
      {STUDENT_TABS.map((tab) => (
        <IonTabButton key={tab.id} tab={tab.id} href={tab.href}>
          <Icon name={tab.icon} size={22} />
          <IonLabel>{t(tab.labelKey)}</IonLabel>
        </IonTabButton>
      ))}
    </IonTabBar>
  );
};

const StudentTabs: FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/home"    component={HomePage} />
      <Route exact path="/tabs/map"     component={MapPage} />
      <Route exact path="/tabs/calm"    component={CalmPage} />
      <Route exact path="/tabs/contact" component={ContactPage} />
      <Route exact path="/tabs/profile" component={ProfilePage} />
      <Route exact path="/tabs"><Redirect to="/tabs/home" /></Route>
    </IonRouterOutlet>
    <StudentTabBar />
  </IonTabs>
);

// ════════════════════════════════════════════════════
// تابات المنسّق
// ════════════════════════════════════════════════════

const STAFF_TABS: { id: string; label: string; icon: IconName; href: string }[] = [
  { id: 'dashboard', label: 'الطلبات',  icon: 'shield', href: '/staff/dashboard' },
  { id: 'chats',     label: 'محادثات', icon: 'phone',  href: '/staff/chats' },
  { id: 'profile',   label: 'حسابي',   icon: 'user',   href: '/staff/profile' },
];

const StaffTabBar: FC = () => {
  const location = useLocation();
  const { user } = useAuthContext();
  const { totalUnread } = useChatThreads(user?.uid, 'staff');
  const selected = tabFromPath(location.pathname, '/staff') || 'dashboard';

  return (
    <IonTabBar
      slot="bottom"
      selectedTab={selected}
      style={{
        '--background': colors.bgCard,
        '--color': colors.textLight,
        '--color-selected': colors.primary,
        fontFamily,
      }}
    >
      {STAFF_TABS.map((t) => (
        <IonTabButton key={t.id} tab={t.id} href={t.href}>
          <div style={{ position: 'relative' }}>
            <Icon name={t.icon} size={22} />
            {t.id === 'chats' && totalUnread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -8,
                minWidth: 16, height: 16, padding: '0 4px',
                borderRadius: 8, background: colors.danger,
                color: colors.white, fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalUnread > 9 ? '9+' : totalUnread}</span>
            )}
          </div>
          <IonLabel>{t.label}</IonLabel>
        </IonTabButton>
      ))}
    </IonTabBar>
  );
};

// نمط Ionic الصحيح: child routes كأخوة داخل IonRouterOutlet للتابات
// /staff/sos/:id و /staff/chats/:id تُعرَض داخل الـ tabs (شريط التاب يبقى ظاهراً)
const StaffTabs: FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/staff/dashboard"  component={StaffDashboardPage} />
      <Route exact path="/staff/chats"      component={ChatListPage} />
      <Route exact path="/staff/profile"    component={StaffProfilePage} />
      {/* مسارات فرعيّة — تظهر داخل الـ tabs */}
      <Route exact path="/staff/sos/:id"    component={StaffSOSDetailPage} />
      <Route exact path="/staff/chats/:id"  component={StaffChatPage} />
      <Route exact path="/staff"><Redirect to="/staff/dashboard" /></Route>
    </IonRouterOutlet>
    <StaffTabBar />
  </IonTabs>
);

// ════════════════════════════════════════════════════
// التوجيه الجذر
// ════════════════════════════════════════════════════

const homePathForRole = (role?: string): string =>
  role === 'staff' ? '/staff/dashboard' : '/tabs/home';

export const AppRoutes: FC = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading } = useProfileContext();
  const { onboarded } = useOnboarding();

  if (authLoading || (user && profileLoading)) {
    return <SplashScreen />;
  }

  const userHome = homePathForRole(profile?.role);
  const entryPath = !onboarded
    ? '/onboarding'
    : user ? userHome : '/auth/login';

  const studentGuard = (page: JSX.Element) => {
    if (!user) return <Redirect to="/auth/login" />;
    if (profile?.role === 'staff') return <Redirect to="/staff/dashboard" />;
    return page;
  };
  const staffGuard = (page: JSX.Element) => {
    if (!user) return <Redirect to="/auth/login" />;
    if (profile?.role !== 'staff') return <Redirect to="/tabs/home" />;
    return page;
  };

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* onboarding */}
        <Route exact path="/onboarding">
          {onboarded ? <Redirect to={user ? userHome : '/auth/login'} /> : <OnboardingPage />}
        </Route>

        {/* auth */}
        <Route exact path="/auth/login"    component={LoginPage} />
        <Route exact path="/auth/register" component={RegisterPage} />
        <Route exact path="/auth/otp"      component={OtpPage} />

        {/* أسماء بديلة شائعة — قبل routes الـ tabs لتفادي تداخل المسارات */}
        <Route exact path="/sign-in"><Redirect to="/auth/login" /></Route>
        <Route exact path="/signin"><Redirect to="/auth/login" /></Route>
        <Route exact path="/login"><Redirect to="/auth/login" /></Route>
        <Route exact path="/sign-up"><Redirect to="/auth/register" /></Route>
        <Route exact path="/signup"><Redirect to="/auth/register" /></Route>
        <Route exact path="/register"><Redirect to="/auth/register" /></Route>
        <Route exact path="/auth"><Redirect to="/auth/login" /></Route>

        {/* تابات المنسّق — يحوي داخله مسارات /staff/* كلّها (بما فيها التفاصيل) */}
        <Route path="/staff">{staffGuard(<StaffTabs />)}</Route>

        {/* محادثات الطالب */}
        <Route exact path="/chats">{studentGuard(<StudentChatListPage />)}</Route>
        <Route exact path="/chat/:id">{studentGuard(<StudentChatPage />)}</Route>

        {/* سجل رسائل SMS — للطالب */}
        <Route exact path="/sms-log">{studentGuard(<SmsLogPage />)}</Route>

        {/* بطاقة الطوارئ الطبية — للطالب (تتطلّب تسجيل دخول) */}
        <Route exact path="/medical-card-mine">{studentGuard(<MedicalCardPage />)}</Route>

        {/* بطاقة الطوارئ الطبية — عرض عامّ من QR (لا يحتاج تسجيل) */}
        <Route exact path="/medical-card" component={PublicMedicalCardPage} />

        {/* ألعاب الطالب */}
        <Route exact path="/games/snake">{studentGuard(<SnakeGamePage />)}</Route>
        <Route exact path="/games/memory">{studentGuard(<MemoryGamePage />)}</Route>

        {/* تابات الطالب */}
        <Route path="/tabs">{studentGuard(<StudentTabs />)}</Route>

        {/* الجذر */}
        <Route exact path="/"><Redirect to={entryPath} /></Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};
