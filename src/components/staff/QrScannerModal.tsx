// ماسح QR داخل تطبيق المنسّق — يقرأ بطاقة الطوارئ مباشرة بدون متصفّح خارجي

import { useEffect, useRef, useState, type FC } from 'react';
import { IonModal } from '@ionic/react';
import { Html5Qrcode } from 'html5-qrcode';
import { decodeMedicalCard, type MedicalCardData } from '../../helpers/medicalCardCodec';
import { MedicalCardView } from './MedicalCardView';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ScannerState = 'idle' | 'scanning' | 'card' | 'error';

export const QrScannerModal: FC<Props> = ({ isOpen, onClose }) => {
  const [state, setState]   = useState<ScannerState>('idle');
  const [card, setCard]     = useState<MedicalCardData | null>(null);
  const [errorMsg, setErr]  = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'sanad-qr-reader';

  // معالج النص الممسوح — يستخرج البطاقة من URL hash أو النص المباشر
  const handleDecoded = (text: string) => {
    let payload = text;
    // إن كان URL، استخرج الـ hash
    try {
      const u = new URL(text);
      if (u.hash && u.hash.length > 1) payload = u.hash.slice(1);
    } catch { /* ليس URL — حاول كنصّ مباشر */ }
    const data = decodeMedicalCard(payload);
    if (data) {
      setCard(data);
      setState('card');
      void stopScanner();
    } else {
      setErr('الـ QR لا يحتوي بطاقة طوارئ صحيحة');
      setState('error');
      void stopScanner();
    }
  };

  const startScanner = async () => {
    setErr('');
    setState('scanning');
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        (decodedText) => { handleDecoded(decodedText); },
        () => { /* ignore decode errors per frame */ },
      );
    } catch (err) {
      console.error('[QR] failed to start:', err);
      setErr('تعذّر فتح الكاميرا — تأكّد من السماح بالوصول');
      setState('error');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
  };

  // بدء عند الفتح، إيقاف عند الإغلاق
  useEffect(() => {
    if (isOpen && state === 'idle') {
      // تأخير صغير ليُركَّب الـ container في DOM
      const t = window.setTimeout(() => { void startScanner(); }, 200);
      return () => window.clearTimeout(t);
    }
    if (!isOpen) {
      setState('idle');
      setCard(null);
      setErr('');
      void stopScanner();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // تنظيف عند فكّ التركيب
  useEffect(() => () => { void stopScanner(); }, []);

  const handleScanAgain = () => {
    setCard(null);
    setErr('');
    setState('idle');
    window.setTimeout(() => { void startScanner(); }, 100);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      style={{ '--background': colors.bg }}
    >
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: colors.bg, fontFamily, direction: 'rtl',
        height: '100%',
      }}>
        {/* رأس */}
        <div style={{
          padding: '20px 16px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.bgDark}`,
        }}>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${colors.primary}18`, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: colors.primary, fontSize: 22, lineHeight: 1, fontWeight: 700 }}>›</span>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
              📷 مسح بطاقة طوارئ طالب
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              {state === 'scanning' && 'وجّه الكاميرا للـ QR'}
              {state === 'card'     && 'تم قراءة البطاقة'}
              {state === 'error'    && 'حدث خطأ'}
              {state === 'idle'     && 'جاري الفتح...'}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* عرض البطاقة بعد القراءة */}
          {state === 'card' && card && (
            <>
              <MedicalCardView card={card} />
              <button
                onClick={handleScanAgain}
                style={{
                  padding: '12px 14px', borderRadius: 14,
                  background: `${colors.primary}15`, color: colors.primary,
                  border: `1.5px solid ${colors.primary}30`,
                  fontFamily, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >📷 مسح بطاقة أخرى</button>
            </>
          )}

          {/* خطأ */}
          {state === 'error' && (
            <div style={{
              background: colors.white, borderRadius: 18,
              padding: 24, textAlign: 'center',
            }}>
              <div style={{ fontSize: 44 }}>⚠️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginTop: 10 }}>
                تعذّرت القراءة
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, marginBottom: 14 }}>
                {errorMsg}
              </div>
              <button
                onClick={handleScanAgain}
                style={{
                  padding: '12px 28px', borderRadius: 50,
                  background: colors.primary, color: colors.white,
                  border: 'none', fontFamily, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >إعادة المحاولة</button>
            </div>
          )}

          {/* الكاميرا (تُملأ من html5-qrcode) — يبقى ظاهراً دائماً ليُحقن فيه */}
          <div
            id={containerId}
            style={{
              display: state === 'card' || state === 'error' ? 'none' : 'block',
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              borderRadius: 18,
              overflow: 'hidden',
              background: '#000',
            }}
          />

          {state === 'scanning' && (
            <div style={{
              fontSize: 12, color: colors.textMuted,
              textAlign: 'center', padding: '8px 14px',
              background: `${colors.primary}10`, borderRadius: 10,
            }}>
              💡 ضع QR داخل المربّع — يُقرأ تلقائياً
            </div>
          )}
        </div>
      </div>
    </IonModal>
  );
};
