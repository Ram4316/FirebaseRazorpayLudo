import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue, off } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { database, functions, auth } from '../config/firebase';
import { colors, typography, spacing, layout } from '../theme';
import { TopBar } from '../components/TopBar';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export const WalletScreen: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const theme = colors.light; // TODO: Add dark mode support
  const currentUser = auth.currentUser;

  // Listen to wallet balance changes
  useEffect(() => {
    if (!currentUser) return;

    const userRef = ref(database, `users/${currentUser.uid}/walletBalance`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const balance = snapshot.val() || 0;
      setWalletBalance(balance);
    });

    return () => off(userRef, 'value', unsubscribe);
  }, [currentUser]);

  // Listen to transactions
  useEffect(() => {
    if (!currentUser) return;

    const transactionsRef = ref(database, `users/${currentUser.uid}/transactions`);
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const transactionsList = Object.entries(data).map(([id, transaction]: [string, any]) => ({
        id,
        ...transaction,
      })).sort((a, b) => b.timestamp - a.timestamp);
      
      setTransactions(transactionsList);
    });

    return () => off(transactionsRef, 'value', unsubscribe);
  }, [currentUser]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate Razorpay payment
      // Call createRazorpayOrder function
      const createOrder = httpsCallable(functions, 'createRazorpayOrder');
      const result = await createOrder({ amount: parseFloat(depositAmount) });
      
      Alert.alert('Success', 'Razorpay integration coming soon');
      setDepositAmount('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const requestWithdrawal = httpsCallable(functions, 'requestWithdrawal');
      await requestWithdrawal({ amount: parseFloat(withdrawAmount) });
      
      Alert.alert('Success', 'Withdrawal request submitted');
      setWithdrawAmount('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.transactionHeader}>
        <Text style={[styles.transactionType, { color: theme.text }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'deposit' || item.type === 'win' ? theme.success : theme.danger }
        ]}>
          {item.type === 'deposit' || item.type === 'win' ? '+' : '-'}₹{item.amount.toFixed(2)}
        </Text>
      </View>
      
      <Text style={[styles.transactionDescription, { color: theme.muted }]}>
        {item.description}
      </Text>
      
      <View style={styles.transactionFooter}>
        <Text style={[styles.transactionDate, { color: theme.muted }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? theme.success : theme.warning }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar 
        title="Wallet" 
        walletBalance={walletBalance}
        showWallet={false}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
        </View>

        {/* Deposit Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Deposit Money</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter amount (₹)"
            placeholderTextColor={theme.muted}
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
            accessibilityLabel="Deposit amount input"
          />
          <PrimaryButton
            title="Deposit via Razorpay"
            onPress={handleDeposit}
            loading={loading}
          />
        </View>

        {/* Withdrawal Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Withdraw Money</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter amount (₹)"
            placeholderTextColor={theme.muted}
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            accessibilityLabel="Withdrawal amount input"
          />
          <SecondaryButton
            title="Request Withdrawal"
            onPress={handleWithdrawal}
            loading={loading}
          />
        </View>

        {/* Transaction History */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              No transactions yet
            </Text>
          ) : (
            <FlatList
              data={transactions.slice(0, 10)} // Show only recent 10
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  balanceCard: {
    borderRadius: layout.borderRadius * 2,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
  },
  section: {
    borderRadius: layout.borderRadius,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: typography.sizes.h2,
    fontFamily: typography.fonts.heading,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 2,
    borderRadius: layout.borderRadius,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.lg,
    minHeight: layout.touchTarget,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    padding: spacing.xl,
  },
  transactionItem: {
    borderRadius: layout.borderRadius,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionType: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '700',
  },
  transactionDescription: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default WalletScreen;