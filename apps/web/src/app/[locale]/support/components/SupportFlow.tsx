'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { formatCurrency, MUNICIPALITIES } from '@sync/shared';
import styles from './SupportFlow.module.css';

interface IssueCoin {
  id: string;
  voteId: string;
  voteTitle: string;
  municipality: string;
  tokenMint: string;
  tokenSymbol: string;
  totalSupply: number;
  currentPrice: number; // SOL
  priceILS: number;
  holdersCount: number;
  voteEndsAt: string;
  status: 'active' | 'ended';
}

interface UserHolding {
  issueCoinId: string;
  tokenAmount: number;
  investedSOL: number;
  investedILS: number;
  currentValueSOL: number;
  currentValueILS: number;
  pnlPercentage: number;
}

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // SOL
}

// Mock data for development
const MOCK_ISSUE_COINS: IssueCoin[] = [
  {
    id: '1',
    voteId: 'v1',
    voteTitle: 'הקמת גינה קהילתית ברחוב הרצל',
    municipality: 'קרית טבעון',
    tokenMint: 'ABC123...',
    tokenSymbol: 'TARU-V1',
    totalSupply: 10000,
    currentPrice: 0.05,
    priceILS: 12.5,
    holdersCount: 45,
    voteEndsAt: '2025-01-25T10:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    voteId: 'v2',
    voteTitle: 'שדרוג תאורת רחובות במרכז',
    municipality: 'קרית טבעון',
    tokenMint: 'DEF456...',
    tokenSymbol: 'TARU-V2',
    totalSupply: 8000,
    currentPrice: 0.03,
    priceILS: 7.5,
    holdersCount: 30,
    voteEndsAt: '2025-01-28T10:00:00Z',
    status: 'active',
  },
  {
    id: '3',
    voteId: 'v3',
    voteTitle: 'בניית מגרש כדורסל חדש',
    municipality: 'תל אביב-יפו',
    tokenMint: 'GHI789...',
    tokenSymbol: 'TARU-V3',
    totalSupply: 15000,
    currentPrice: 0.08,
    priceILS: 20,
    holdersCount: 72,
    voteEndsAt: '2025-02-01T10:00:00Z',
    status: 'active',
  },
];

const MOCK_HOLDINGS: UserHolding[] = [
  {
    issueCoinId: '1',
    tokenAmount: 100,
    investedSOL: 4.5,
    investedILS: 1125,
    currentValueSOL: 5,
    currentValueILS: 1250,
    pnlPercentage: 11.1,
  },
];

function WalletConnect({
  wallet,
  onConnect,
  onDisconnect,
}: {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (wallet.connected) {
    return (
      <div className={styles.walletConnected}>
        <div className={styles.walletInfo}>
          <div className={styles.walletIcon}>🔗</div>
          <div>
            <Text size="sm" weight="medium">
              {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </Text>
            <Text size="xs" color="muted">
              {wallet.balance.toFixed(4)} SOL
            </Text>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          התנתק
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.walletConnect}>
      <div className={styles.walletPrompt}>
        <div className={styles.walletIcon}>🔐</div>
        <div>
          <Heading level={3}>חברו ארנק Solana</Heading>
          <Text color="secondary">
            כדי לרכוש Issue Coins, חברו ארנק Phantom או Solflare
          </Text>
        </div>
      </div>
      <div className={styles.walletButtons}>
        <Button onClick={onConnect}>
          <span className={styles.walletLogo}>👻</span>
          Phantom
        </Button>
        <Button variant="outline" onClick={onConnect}>
          <span className={styles.walletLogo}>🌞</span>
          Solflare
        </Button>
      </div>
    </div>
  );
}

function IssueCoinCard({
  coin,
  onSelect,
  selected,
}: {
  coin: IssueCoin;
  onSelect: () => void;
  selected: boolean;
}) {
  const daysRemaining = Math.ceil(
    (new Date(coin.voteEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      className={`${styles.coinCard} ${selected ? styles.selected : ''}`}
      variants={fadeInUp}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.coinHeader}>
        <span className={styles.coinSymbol}>{coin.tokenSymbol}</span>
        <span className={styles.coinMunicipality}>{coin.municipality}</span>
      </div>

      <Text weight="medium" className={styles.coinTitle}>
        {coin.voteTitle}
      </Text>

      <div className={styles.coinStats}>
        <div className={styles.coinStat}>
          <Text size="xs" color="muted">מחיר</Text>
          <Text weight="semibold">{coin.currentPrice} SOL</Text>
        </div>
        <div className={styles.coinStat}>
          <Text size="xs" color="muted">תומכים</Text>
          <Text weight="semibold">{coin.holdersCount}</Text>
        </div>
        <div className={styles.coinStat}>
          <Text size="xs" color="muted">נותרו</Text>
          <Text weight="semibold">{daysRemaining} ימים</Text>
        </div>
      </div>

      {selected && (
        <motion.div
          className={styles.selectedIndicator}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

function TradingPanel({
  coin,
  wallet,
  onTrade,
}: {
  coin: IssueCoin | null;
  wallet: WalletState;
  onTrade: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!coin) {
    return (
      <div className={styles.tradingPanel}>
        <div className={styles.tradingEmpty}>
          <Text color="muted">בחרו Issue Coin לרכישה</Text>
        </div>
      </div>
    );
  }

  const solAmount = parseFloat(amount) || 0;
  const tokensReceived = solAmount > 0 ? Math.floor(solAmount / coin.currentPrice) : 0;
  const totalILS = solAmount * 250; // Approx SOL to ILS conversion

  const handleTrade = async () => {
    if (solAmount <= 0 || solAmount > wallet.balance) return;
    setLoading(true);
    // Simulate trade
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onTrade(solAmount);
    setAmount('');
    setLoading(false);
  };

  return (
    <div className={styles.tradingPanel}>
      <div className={styles.tradingHeader}>
        <Heading level={3}>רכישת {coin.tokenSymbol}</Heading>
        <Text size="sm" color="secondary">{coin.voteTitle}</Text>
      </div>

      <div className={styles.tradingForm}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>כמות SOL</label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              max={wallet.balance}
            />
            <button
              className={styles.maxButton}
              onClick={() => setAmount(wallet.balance.toString())}
            >
              מקסימום
            </button>
          </div>
          <Text size="xs" color="muted">
            יתרה: {wallet.balance.toFixed(4)} SOL
          </Text>
        </div>

        <div className={styles.tradePreview}>
          <div className={styles.previewRow}>
            <Text size="sm" color="secondary">תקבלו</Text>
            <Text weight="semibold">{tokensReceived.toLocaleString()} טוקנים</Text>
          </div>
          <div className={styles.previewRow}>
            <Text size="sm" color="secondary">שווי ב-ILS</Text>
            <Text weight="semibold">{formatCurrency(totalILS)}</Text>
          </div>
          <div className={styles.previewRow}>
            <Text size="sm" color="secondary">עמלת רשת</Text>
            <Text weight="semibold">~0.001 SOL</Text>
          </div>
        </div>

        <Button
          onClick={handleTrade}
          disabled={solAmount <= 0 || solAmount > wallet.balance || loading}
          className={styles.tradeButton}
        >
          {loading ? 'מבצע עסקה...' : 'רכוש עכשיו'}
        </Button>
      </div>

      <div className={styles.nftPreview}>
        <div className={styles.nftPreviewIcon}>🎖️</div>
        <div>
          <Text size="sm" weight="medium">NFT תומך אזרחי</Text>
          <Text size="xs" color="muted">
            תקבלו NFT ייחודי כשההצבעה תסתיים
          </Text>
        </div>
      </div>
    </div>
  );
}

function PortfolioSection({ holdings }: { holdings: UserHolding[] }) {
  if (holdings.length === 0) {
    return (
      <div className={styles.portfolioEmpty}>
        <Text color="muted">עדיין אין לכם Issue Coins</Text>
      </div>
    );
  }

  const totalValueSOL = holdings.reduce((sum, h) => sum + h.currentValueSOL, 0);
  const totalValueILS = holdings.reduce((sum, h) => sum + h.currentValueILS, 0);
  const totalInvestedILS = holdings.reduce((sum, h) => sum + h.investedILS, 0);
  const totalPnL = ((totalValueILS - totalInvestedILS) / totalInvestedILS) * 100;

  return (
    <div className={styles.portfolio}>
      <Heading level={3}>התיק שלך</Heading>

      <div className={styles.portfolioSummary}>
        <div className={styles.portfolioStat}>
          <Text size="sm" color="secondary">שווי כולל</Text>
          <Text size="xl" weight="bold">{totalValueSOL.toFixed(4)} SOL</Text>
          <Text size="sm" color="muted">{formatCurrency(totalValueILS)}</Text>
        </div>
        <div className={styles.portfolioStat}>
          <Text size="sm" color="secondary">רווח/הפסד</Text>
          <Text
            size="xl"
            weight="bold"
            className={totalPnL >= 0 ? styles.positive : styles.negative}
          >
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(1)}%
          </Text>
        </div>
      </div>

      <div className={styles.holdingsList}>
        {holdings.map((holding) => (
          <div key={holding.issueCoinId} className={styles.holdingItem}>
            <div className={styles.holdingInfo}>
              <Text weight="medium">{holding.tokenAmount.toLocaleString()} טוקנים</Text>
              <Text size="xs" color="muted">
                השקעה: {formatCurrency(holding.investedILS)}
              </Text>
            </div>
            <div className={styles.holdingValue}>
              <Text weight="semibold">{holding.currentValueSOL.toFixed(4)} SOL</Text>
              <Text
                size="xs"
                className={holding.pnlPercentage >= 0 ? styles.positive : styles.negative}
              >
                {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(1)}%
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupportFlow() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
  });
  const [issueCoins, setIssueCoins] = useState<IssueCoin[]>([]);
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<IssueCoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active votes with Issue Coins
        const res = await fetch('/api/votes?status=active');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Transform to IssueCoin format (mock for now)
        setIssueCoins(MOCK_ISSUE_COINS);
        setHoldings(MOCK_HOLDINGS);
      } catch (err) {
        console.error('Error fetching issue coins:', err);
        setIssueCoins(MOCK_ISSUE_COINS);
        setHoldings(MOCK_HOLDINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConnect = useCallback(() => {
    // Simulate wallet connection
    setWallet({
      connected: true,
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      balance: 2.5,
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      balance: 0,
    });
    setHoldings([]);
  }, []);

  const handleTrade = useCallback((amount: number) => {
    if (!selectedCoin) return;

    const tokensReceived = Math.floor(amount / selectedCoin.currentPrice);
    const newHolding: UserHolding = {
      issueCoinId: selectedCoin.id,
      tokenAmount: tokensReceived,
      investedSOL: amount,
      investedILS: amount * 250,
      currentValueSOL: amount,
      currentValueILS: amount * 250,
      pnlPercentage: 0,
    };

    setHoldings((prev) => [...prev, newHolding]);
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
    }));
  }, [selectedCoin]);

  // Filter Issue Coins
  const filteredCoins = issueCoins.filter(
    (coin) => municipalityFilter === 'all' || coin.municipality === municipalityFilter
  );

  // Get unique municipalities
  const municipalities = ['all', ...new Set(issueCoins.map((c) => c.municipality))];

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <Text>טוען...</Text>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Wallet Connection */}
        <WalletConnect
          wallet={wallet}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        <AnimatePresence>
          {wallet.connected && (
            <motion.div
              className={styles.mainContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={styles.leftPanel}>
                {/* Municipality Filter */}
                <div className={styles.filterRow}>
                  <Text size="sm" weight="medium">סנן לפי רשות:</Text>
                  <select
                    className={styles.select}
                    value={municipalityFilter}
                    onChange={(e) => setMunicipalityFilter(e.target.value)}
                  >
                    {municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m === 'all' ? 'כל הרשויות' : m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Coins Grid */}
                <motion.div
                  className={styles.coinsGrid}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCoins.map((coin) => (
                    <IssueCoinCard
                      key={coin.id}
                      coin={coin}
                      onSelect={() => setSelectedCoin(coin)}
                      selected={selectedCoin?.id === coin.id}
                    />
                  ))}
                </motion.div>

                {filteredCoins.length === 0 && (
                  <div className={styles.emptyState}>
                    <Text color="muted">אין Issue Coins זמינים ברשות זו</Text>
                  </div>
                )}
              </div>

              <div className={styles.rightPanel}>
                {/* Trading Panel */}
                <TradingPanel
                  coin={selectedCoin}
                  wallet={wallet}
                  onTrade={handleTrade}
                />

                {/* Portfolio */}
                <PortfolioSection holdings={holdings} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!wallet.connected && (
          <div className={styles.previewSection}>
            <Heading level={3}>Issue Coins פעילים</Heading>
            <Text color="secondary" className={styles.previewSubtext}>
              חברו ארנק כדי לרכוש
            </Text>

            <motion.div
              className={styles.coinsGrid}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {issueCoins.slice(0, 3).map((coin) => (
                <IssueCoinCard
                  key={coin.id}
                  coin={coin}
                  onSelect={() => {}}
                  selected={false}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
