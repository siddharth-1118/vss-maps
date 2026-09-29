import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, Navigation, Send, Check, RefreshCw, Trash2, MapPin, Download, Upload, Copy, Wifi, QrCode } from './Icons';

interface MeshPacket {
  id: string;
  sender: string;
  text: string;
  lat: number;
  lng: number;
  mode: 'bluetooth_mesh' | 'data_mule' | 'intranet_webrtc' | 'lora_hardware';
  timestamp: string;
  status: 'sent' | 'relayed' | 'pending';
  hops: number;
}

interface OfflineMeshPanelProps {
  mapCenter: [number, number];
  onFlyToCoords: (lat: number, lng: number) => void;
}

export const OfflineMeshPanel: React.FC<OfflineMeshPanelProps> = ({ mapCenter, onFlyToCoords }) => {
  const [protocol, setProtocol] = useState<'bluetooth_mesh' | 'data_mule' | 'intranet_webrtc' | 'lora_hardware'>('bluetooth_mesh');
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState(() => 'Node_' + Math.floor(1000 + Math.random() * 9000));
  const [packets, setPackets] = useState<MeshPacket[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // WebRTC P2P Direct Connection State
  const [showP2PModal, setShowP2PModal] = useState(false);
  const [localSdpOffer, setLocalSdpOffer] = useState('');
  const [remoteSdpInput, setRemoteSdpInput] = useState('');
  const [p2pRole, setP2pRole] = useState<'host' | 'client' | 'none'>('none');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for local tabs & load stored packets
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vss_mesh_packets');
      if (stored) {
        setPackets(JSON.parse(stored));
      } else {
        const samplePackets: MeshPacket[] = [
          {
            id: 'pkt_1',
            sender: 'Kashmir_Relay_Node_42',
            text: 'SOS: Pass clear near Banihal. Relaying via transit mule.',
            lat: 34.0837,
            lng: 74.7973,
            mode: 'data_mule',
            timestamp: '08:45 AM',
            status: 'relayed',
            hops: 3,
          },
          {
            id: 'pkt_2',
            sender: 'Kanyakumari_Node_88',
            text: 'Packet received in Kanyakumari via local WebRTC gateway.',
            lat: 8.0883,
            lng: 77.5385,
            mode: 'intranet_webrtc',
            timestamp: '08:52 AM',
            status: 'sent',
            hops: 7,
          },
        ];
        setPackets(samplePackets);
        localStorage.setItem('vss_mesh_packets', JSON.stringify(samplePackets));
      }
    } catch (e) {
      console.error('Failed to load mesh packets:', e);
    }

    // BroadcastChannel sync between open windows/tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('vss_maps_mesh_channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'MESH_PACKET') {
          const newPkt = event.data.packet;
          setPackets((prev) => {
            if (prev.some((p) => p.id === newPkt.id)) return prev;
            const updated = [newPkt, ...prev];
            localStorage.setItem('vss_mesh_packets', JSON.stringify(updated));
            return updated;
          });
        }
      };
    }

    return () => {
      broadcastChannelRef.current?.close();
      peerConnectionRef.current?.close();
    };
  }, []);

  const savePackets = (updated: MeshPacket[]) => {
    setPackets(updated);
    localStorage.setItem('vss_mesh_packets', JSON.stringify(updated));
  };

  // Broadcast packet to local BroadcastChannel and active WebRTC DataChannel
  const dispatchPacketToPeers = (packet: MeshPacket) => {
    // BroadcastChannel
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'MESH_PACKET', packet });
    }
    // WebRTC DataChannel
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({ type: 'MESH_PACKET', packet }));
    }
  };

  const handleSendPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newPkt: MeshPacket = {
      id: 'pkt_' + Date.now(),
      sender: senderName || 'Anonymous_Node',
      text: messageText,
      lat: mapCenter[0],
      lng: mapCenter[1],
      mode: protocol,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: peerConnected ? 'sent' : protocol === 'data_mule' ? 'pending' : 'relayed',
      hops: peerConnected ? 1 : 0,
    };

    const updated = [newPkt, ...packets];
    savePackets(updated);
    dispatchPacketToPeers(newPkt);
    setMessageText('');
  };

  // WebRTC Host Session Generator (Device A - e.g. Laptop)
  const initWebRtcHost = async () => {
    setP2pRole('host');
    const pc = new RTCPeerConnection({ iceServers: [] });
    peerConnectionRef.current = pc;

    const dc = pc.createDataChannel('vss_mesh_channel');
    dataChannelRef.current = dc;
    setupDataChannelListeners(dc);

    pc.onicecandidate = (e) => {
      if (!e.candidate && pc.localDescription) {
        setLocalSdpOffer(btoa(JSON.stringify(pc.localDescription)));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  };

  // WebRTC Client Joiner (Device B - e.g. Mobile)
  const initWebRtcClient = async (encodedOffer: string) => {
    try {
      setP2pRole('client');
      const offerDesc = JSON.parse(atob(encodedOffer));
      const pc = new RTCPeerConnection({ iceServers: [] });
      peerConnectionRef.current = pc;

      pc.ondatachannel = (e) => {
        dataChannelRef.current = e.channel;
        setupDataChannelListeners(e.channel);
      };

      pc.onicecandidate = (e) => {
        if (!e.candidate && pc.localDescription) {
          setLocalSdpOffer(btoa(JSON.stringify(pc.localDescription)));
        }
      };

      await pc.setRemoteDescription(offerDesc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
    } catch (err) {
      alert('Invalid connection token. Please copy the complete Offer code from Laptop.');
    }
  };

  // Complete WebRTC Handshake on Host
  const completeWebRtcHandshake = async (encodedAnswer: string) => {
    try {
      if (!peerConnectionRef.current) return;
      const answerDesc = JSON.parse(atob(encodedAnswer));
      await peerConnectionRef.current.setRemoteDescription(answerDesc);
    } catch (err) {
      alert('Failed to establish P2P connection. Verify the Answer code copied from phone.');
    }
  };

  const setupDataChannelListeners = (dc: RTCDataChannel) => {
    dc.onopen = () => setPeerConnected(true);
    dc.onclose = () => setPeerConnected(false);
    dc.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'MESH_PACKET') {
          setPackets((prev) => {
            if (prev.some((p) => p.id === payload.packet.id)) return prev;
            const updated = [payload.packet, ...prev];
            localStorage.setItem('vss_mesh_packets', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.error('Failed to parse WebRTC payload:', e);
      }
    };
  };

  // Export Mule Bundle to File (Zero Internet Transfer)
  const handleExportMuleBundle = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packets, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `vss_mule_bundle_${Date.now()}.json`;
    a.click();
  };

  // Import Mule Bundle from JSON File
  const handleImportMuleBundle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPackets: MeshPacket[] = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedPackets)) {
          const merged = [...importedPackets, ...packets].reduce((acc: MeshPacket[], current) => {
            if (!acc.some((item) => item.id === current.id)) acc.push(current);
            return acc;
          }, []);
          savePackets(merged);
          alert(`Successfully imported ${importedPackets.length} offline packets into local mesh database!`);
        }
      } catch (err) {
        alert('Invalid packet file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleScanPeers = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  const handleClearPackets = () => {
    savePackets([]);
  };

  const PROTOCOL_INFO = {
    bluetooth_mesh: {
      name: 'Direct Local P2P Mesh',
      desc: 'Free 150m WebRTC / Bluetooth / Wi-Fi Direct hops between nearby phones & laptop.',
      color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    },
    data_mule: {
      name: 'Transit Data Mule (100km+)',
      desc: 'Packages message bundle into local storage to carry across 100km+ gaps via buses/trains.',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    intranet_webrtc: {
      name: 'Station Intranet / WebRTC',
      desc: 'Direct WebRTC peer connections across local offline Wi-Fi router networks.',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    lora_hardware: {
      name: 'Web Bluetooth / LoRa Radio',
      desc: 'Interfaces with pocket LoRa radio modules over Web Bluetooth (15km+ range).',
      color: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    },
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              Offline Mesh & Relays
              <span className="text-[9px] font-semibold tracking-widest uppercase bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                ₹0 COST
              </span>
            </h2>
            <p className="text-[10px] text-slate-500">Off-grid P2P messaging without internet</p>
          </div>
        </div>

        {/* Live Peer Connectivity Status Badge */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="text-[10px] font-mono text-slate-300">
            {peerConnected ? 'P2P LIVE' : 'LAN STANDBY'}
          </span>
        </div>
      </div>

      {/* Direct Phone & Laptop Pairing Box */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-blue-400" />
            Pair Laptop & Mobile (Direct P2P)
          </span>
          <button
            onClick={() => setShowP2PModal(!showP2PModal)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-all"
          >
            {showP2PModal ? 'Close P2P Setup' : '🔗 Connect Devices'}
          </button>
        </div>

        {showP2PModal && (
          <div className="space-y-3 pt-2 text-xs border-t border-blue-500/20 animate-fade-in">
            {p2pRole === 'none' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={initWebRtcHost}
                  className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 text-blue-200 font-bold text-left"
                >
                  <div>1. Create P2P Session</div>
                  <div className="text-[10px] text-slate-400 font-normal">Generate Offer Code on Laptop</div>
                </button>
                <button
                  onClick={() => setP2pRole('client')}
                  className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/40 hover:bg-teal-500/30 text-teal-200 font-bold text-left"
                >
                  <div>2. Join P2P Session</div>
                  <div className="text-[10px] text-slate-400 font-normal">Enter Offer Code on Phone</div>
                </button>
              </div>
            )}

            {p2pRole === 'host' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-300">
                  <strong>Step A:</strong> Copy this Offer Code and paste it on your Mobile device:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={localSdpOffer || 'Generating offer code...'}
                    className="flex-1 px-2.5 py-1.5 rounded-xl input-premium text-[10px] font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(localSdpOffer);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-[10px] text-slate-300 pt-1">
                  <strong>Step B:</strong> Paste the Answer Code generated by your Mobile below:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste Answer Code from phone..."
                    value={remoteSdpInput}
                    onChange={(e) => setRemoteSdpInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl input-premium text-[10px] font-mono"
                  />
                  <button
                    onClick={() => completeWebRtcHandshake(remoteSdpInput)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  >
                    Pair
                  </button>
                </div>
              </div>
            )}

            {p2pRole === 'client' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-300">
                  <strong>Step 1:</strong> Paste the Offer Code generated by your Laptop:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste Offer Code from laptop..."
                    value={remoteSdpInput}
                    onChange={(e) => setRemoteSdpInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl input-premium text-[10px] font-mono"
                  />
                  <button
                    onClick={() => initWebRtcClient(remoteSdpInput)}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400"
                  >
                    Generate Answer
                  </button>
                </div>

                {localSdpOffer && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-slate-300">
                      <strong>Step 2:</strong> Copy this Answer Code back to Laptop:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={localSdpOffer}
                        className="flex-1 px-2.5 py-1.5 rounded-xl input-premium text-[10px] font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(localSdpOffer);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protocol Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Select Offline Relay Protocol
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['bluetooth_mesh', 'data_mule', 'intranet_webrtc', 'lora_hardware'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                protocol === p
                  ? PROTOCOL_INFO[p].color
                  : 'border-white/[0.05] bg-white/[0.02] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold leading-tight">{PROTOCOL_INFO[p].name}</div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 italic bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
          {PROTOCOL_INFO[protocol].desc}
        </p>
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendPacket} className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your Alias"
            className="w-1/3 px-3 py-2 rounded-xl input-premium text-xs font-mono"
          />
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type offline packet message or SOS..."
            className="flex-1 px-3 py-2 rounded-xl input-premium text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScanPeers}
            disabled={isScanning}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Nearby Peers'}</span>
          </button>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="flex-1 py-2 btn-primary text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Packet</span>
          </button>
        </div>
      </form>

      {/* Mule Data Bundle Export & Import Bar */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
        <span className="text-amber-300 font-semibold flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Transit Mule Bundle:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMuleBundle}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] font-bold"
          >
            Export Bundle
          </button>
          <label className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] font-bold cursor-pointer">
            Import Bundle
            <input type="file" accept=".json" onChange={handleImportMuleBundle} className="hidden" />
          </label>
        </div>
      </div>

      {/* Coords Payload Banner */}
      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-[11px] text-slate-300">
        <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          Attached Coords Payload:
        </span>
        <span className="font-mono text-white font-bold">{mapCenter[0].toFixed(4)}°, {mapCenter[1].toFixed(4)}°</span>
      </div>

      {/* Offline Packet Stream */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Offline Packet Log ({packets.length})
          </label>
          {packets.length > 0 && (
            <button
              onClick={handleClearPackets}
              className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear Log
            </button>
          )}
        </div>

        {packets.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            No offline packets broadcast yet. Type a message above to start.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                className="glass-card rounded-2xl p-3 space-y-1.5 border border-white/[0.06] hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {pkt.sender}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{pkt.timestamp}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">{pkt.text}</p>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/[0.04]">
                  <button
                    onClick={() => onFlyToCoords(pkt.lat, pkt.lng)}
                    className="font-mono text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {pkt.lat.toFixed(4)}, {pkt.lng.toFixed(4)}
                  </button>

                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <span>{pkt.hops} Hops</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 font-sans">
                      {pkt.mode.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
