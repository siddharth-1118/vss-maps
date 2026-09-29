import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Navigation, Send, Check, RefreshCw, Trash2, MapPin } from './Icons';

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
  const [senderName, setSenderName] = useState('User_' + Math.floor(1000 + Math.random() * 9000));
  const [packets, setPackets] = useState<MeshPacket[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Load existing packets from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vss_mesh_packets');
      if (stored) setPackets(JSON.parse(stored));
      else {
        // Sample initial offline packets
        const samplePackets: MeshPacket[] = [
          {
            id: 'pkt_1',
            sender: 'Kashmir_Relay_Node_42',
            text: 'SOS: Road blocked near pass. Relaying via transit mule.',
            lat: 34.0837,
            lng: 74.7973,
            mode: 'data_mule',
            timestamp: '08:45 AM',
            status: 'relayed',
            hops: 3,
          },
          {
            id: 'pkt_2',
            sender: 'South_Mesh_Node_88',
            text: 'Packet received in Kanyakumari via station Intranet gateway.',
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
  }, []);

  const savePackets = (updated: MeshPacket[]) => {
    setPackets(updated);
    localStorage.setItem('vss_mesh_packets', JSON.stringify(updated));
  };

  const handleSendPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newPkt: MeshPacket = {
      id: 'pkt_' + Date.now(),
      sender: senderName || 'Anonymous',
      text: messageText,
      lat: mapCenter[0],
      lng: mapCenter[1],
      mode: protocol,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: protocol === 'data_mule' ? 'pending' : 'sent',
      hops: protocol === 'data_mule' ? 1 : 0,
    };

    const updated = [newPkt, ...packets];
    savePackets(updated);
    setMessageText('');
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
      name: 'Direct Phone Mesh',
      desc: 'Free 150m Bluetooth / Wi-Fi Direct hops between nearby phones.',
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
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
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
            placeholder="Your Alias / Call sign"
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
            <span>{isScanning ? 'Scanning Mesh...' : 'Scan Nearby Peers'}</span>
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
