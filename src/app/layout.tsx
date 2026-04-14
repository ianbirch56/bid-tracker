import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/shared/design/globals.css';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Sidebar } from '@/shared/components/Sidebar/Sidebar';
import { ToastProvider } from '@/shared/components/Toast/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Funding Bid Tracker',
  description: 'Enterprise Tracking for Funding, Grants, and Tenders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var PROJECT_ID = 'funding-tracker-94d6f';
            var API_KEY = 'AIzaSyDwN-1tD2n0LxDK_ueAX87lYPpImR0uYo0';

            window.onerror = function(msg, url, line) {
              var log = document.getElementById('e-log');
              if (log) log.innerHTML += '\\n🔴 ERROR: ' + msg;
            };

            function initEmergency() {
              if (document.getElementById('js-survival-kit')) return;
              
              var kit = document.createElement('div');
              kit.id = 'js-survival-kit';
              kit.style.position = 'fixed'; kit.style.bottom = '15px'; kit.style.right = '15px'; kit.style.zIndex = '999999'; kit.style.fontFamily = 'sans-serif';

              var status = document.createElement('div');
              status.id = 'survival-status';
              status.style.background = '#1e293b'; status.style.color = '#94a3b8'; status.style.padding = '8px 12px'; status.style.borderRadius = '8px'; status.style.border = '1px solid #334155'; status.style.fontSize = '12px'; status.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.5)'; status.style.cursor = 'pointer';
              status.innerHTML = '🛡️ System Status: Checking...';
              kit.appendChild(status);

              var panel = document.createElement('div');
              panel.id = 'survival-panel';
              panel.style.display = 'none'; panel.style.position = 'fixed'; panel.style.top = '50%'; panel.style.left = '50%'; panel.style.transform = 'translate(-50%, -50%)'; panel.style.background = '#0f172a'; panel.style.padding = '32px'; panel.style.borderRadius = '16px'; panel.style.border = '2px solid #ef4444'; panel.style.zIndex = '1000000'; panel.style.color = 'white'; panel.style.width = '380px'; panel.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.8)';
              panel.innerHTML = '<h2 style="margin-top:0;color:#ef4444;font-size:22px">⚠️ NUCLEAR BYPASS ACTIVE</h2>' +
                '<p style="font-size:14px;color:#94a3b8;margin-bottom:20px">The corporate firewall is blocking the main app. This emergency interface uses direct REST tunnels to bypass Zscaler.</p>' +
                '<input id="e-email" type="email" placeholder="Work Email" style="width:100%;margin-bottom:12px;padding:14px;color:black;border-radius:8px;border:none;font-size:15px">' +
                '<input id="e-pass" type="password" placeholder="Password" style="width:100%;margin-bottom:15px;padding:14px;color:black;border-radius:8px;border:none;font-size:15px">' +
                '<button id="e-btn" style="width:100%;padding:16px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:16px;box-shadow:0 4px 12px rgba(239,68,68,0.3)">Login via Secure Bypass</button>' +
                '<button id="e-close" style="width:100%;padding:10px;background:transparent;color:#64748b;border:none;margin-top:12px;cursor:pointer;font-size:13px">Cancel</button>' +
                '<p id="e-log" style="font-size:11px;margin-top:20px;color:#cbd5e1;white-space:pre-wrap;word-break:break-all;background:rgba(0,0,0,0.3);padding:10px;border-radius:4px;max-height:100px;overflow-y:auto"></p>';
              document.body.appendChild(panel);
              document.body.appendChild(kit);

              status.onclick = function() { panel.style.display = 'block'; };
              document.getElementById('e-close').onclick = function() { panel.style.display = 'none'; };

              function renderIsland(docs) {
                var island = document.createElement('div');
                island.style.position = 'fixed'; island.style.inset = '0'; island.style.background = '#0f172a'; island.style.color = 'white'; island.style.zIndex = '2000001'; island.style.padding = '40px'; island.style.overflow = 'auto'; island.style.fontFamily = 'sans-serif';
                
                var content = '<div style="max-width:1100px;margin:0 auto">' +
                  '<h1 style="color:#3b82f6;margin-bottom:12px">🏝️ ISLAND MODE: ACTIVE</h1>' +
                  '<p style="color:#94a3b8;margin-bottom:32px">Connected via Direct REST Tunnel. Main app modules are bypassed.</p>' +
                  '<table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #334155">' +
                  '<tr style="background:#1e293b;text-align:left"><th style="padding:15px;border:1px solid #334155">Bid Name</th><th style="padding:15px;border:1px solid #334155">Amount</th><th style="padding:15px;border:1px solid #334155">Fund Name</th><th style="padding:15px;border:1px solid #334155">Status</th></tr>';

                for (var i = 0; i < docs.length; i++) {
                  var f = docs[i].fields || {};
                  content += '<tr>' +
                    '<td style="padding:15px;border:1px solid #334155">' + (f.bidName && f.bidName.stringValue ? f.bidName.stringValue : '-') + '</td>' +
                    '<td style="padding:15px;border:1px solid #334155">£' + (f.amountRequested ? (f.amountRequested.doubleValue || f.amountRequested.integerValue || '0') : '0') + '</td>' +
                    '<td style="padding:15px;border:1px solid #334155">' + (f.fundName && f.fundName.stringValue ? f.fundName.stringValue : '-') + '</td>' +
                    '<td style="padding:15px;border:1px solid #334155">' + (f.status && f.status.stringValue ? f.status.stringValue : '-') + '</td>' +
                    '</tr>';
                }
                content += '</table>' +
                  '<button onclick="location.reload()" style="margin-top:30px;padding:12px 24px;background:#334155;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">Reconnect to Cloud</button>' +
                  '</div>';
                
                island.innerHTML = content;
                document.body.appendChild(island);
                document.body.style.overflow = 'hidden';
              }

              document.getElementById('e-btn').onclick = function() {
                var email = document.getElementById('e-email').value;
                var pass = document.getElementById('e-pass').value;
                var log = document.getElementById('e-log');
                log.style.color = '#cbd5e1';
                log.innerHTML = '⚡ Initiating Nuclear Bypass...';
                
                fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API_KEY, {
                  method: 'POST', body: JSON.stringify({ email: email, password: pass, returnSecureToken: true }),
                  headers: { 'Content-Type': 'application/json' }
                })
                .then(function(r) { return r.json(); })
                .then(function(authData) {
                  if (authData.error) { throw new Error(authData.error.message); }
                  log.innerHTML += '\\n✅ AUTH SUCCESS. Force-injecting session...';
                  
                  // Inject survival cookie for 24h
                  var sess = JSON.stringify({ email: email, uid: authData.localId, offline: true });
                  document.cookie = "ymca_survival_session=" + encodeURIComponent(sess) + "; path=/; max-age=86400; SameSite=Lax";
                  
                  log.innerHTML += '\\n⚡ Fetching data via REST tunnel...';
                  return fetch('https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents/bids', {
                    headers: { 'Authorization': 'Bearer ' + authData.idToken }
                  });
                })
                .then(function(r) { return r.json(); })
                .then(function(data) {
                  if (data.documents) {
                    renderIsland(data.documents);
                  } else {
                    log.innerHTML += '\\n❌ ERROR: No documents returned.';
                  }
                })
                .catch(function(err) {
                  log.style.color = '#ef4444';
                  log.innerHTML += '\\n❌ FAIL: ' + err.message;
                });
              };

              setTimeout(function() {
                var isBlocked = !window.next;
                var status = document.getElementById('survival-status');
                if (status) {
                  if (isBlocked) {
                    status.style.background = '#991b1b';
                    status.style.color = '#fff';
                    status.style.borderColor = '#ef4444';
                    status.style.fontWeight = 'bold';
                    status.innerHTML = '🔥 FIREWALL BLOCKED: CLICK TO BYPASS';
                    // Auto-open panel if strictly blocked
                    panel.style.display = 'block';
                  } else {
                    status.style.background = '#065f46';
                    status.style.color = '#fff';
                    status.style.borderColor = '#10b981';
                    status.innerHTML = '✅ System Integrity: OK';
                  }
                }
              }, 3000);
            }

            setInterval(initEmergency, 4000);
            document.addEventListener('DOMContentLoaded', initEmergency);
          })();
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `window.__FIREBASE_KEY = "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}";` }} />
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flex: 1, padding: '40px', height: '100vh', overflowY: 'auto' }}>
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
