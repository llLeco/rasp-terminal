import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import {
  startTerminal,
  sendTerminalData,
  resizeTerminal as resizeSocket,
  onTerminalData,
  onTerminalReady,
  onTerminalExit,
  stopTerminal,
} from '../services/socket';

export const useTerminal = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initTerminal = useCallback(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: '#0a0a0a',
        foreground: '#00ff00',
        cursor: '#00ff00',
        cursorAccent: '#0a0a0a',
        selectionBackground: '#003300',
        selectionForeground: '#00ff00',
        black: '#0a0a0a',
        red: '#ff3333',
        green: '#00ff00',
        yellow: '#ffb000',
        blue: '#3399ff',
        magenta: '#ff33ff',
        cyan: '#33ffff',
        white: '#cccccc',
        brightBlack: '#666666',
        brightRed: '#ff6666',
        brightGreen: '#33ff33',
        brightYellow: '#ffcc00',
        brightBlue: '#66b3ff',
        brightMagenta: '#ff66ff',
        brightCyan: '#66ffff',
        brightWhite: '#ffffff',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Send input to server
    terminal.onData((data) => {
      sendTerminalData(data);
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current && terminalRef.current) {
        fitAddonRef.current.fit();
        resizeSocket(terminalRef.current.cols, terminalRef.current.rows);
      }
    };

    window.addEventListener('resize', handleResize);

    // Start terminal session
    startTerminal({
      cols: terminal.cols,
      rows: terminal.rows,
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  useEffect(() => {
    const cleanupInit = initTerminal();

    // Handle incoming data
    const cleanupData = onTerminalData((data) => {
      terminalRef.current?.write(data);
    });

    const cleanupReady = onTerminalReady(() => {
      setIsReady(true);
      terminalRef.current?.focus();
    });

    const cleanupExit = onTerminalExit(() => {
      terminalRef.current?.writeln('\r\n[Session ended]');
      setIsReady(false);
    });

    return () => {
      cleanupInit?.();
      cleanupData();
      cleanupReady();
      cleanupExit();
      stopTerminal();
      terminalRef.current?.dispose();
      terminalRef.current = null;
    };
  }, [initTerminal]);

  const fit = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      fitAddonRef.current.fit();
      resizeSocket(terminalRef.current.cols, terminalRef.current.rows);
    }
  }, []);

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  const clear = useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  const write = useCallback((data: string) => {
    sendTerminalData(data);
  }, []);

  return {
    terminal: terminalRef.current,
    isReady,
    fit,
    focus,
    clear,
    write,
  };
};
