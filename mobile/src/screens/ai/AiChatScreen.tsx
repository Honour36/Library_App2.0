import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bot, Copy, Paperclip, Send, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { askGemini } from '../../api/aiApi';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/designSystem';

const QUICK_PROMPTS = ['Summarize PDF', 'Explain', 'Find Sources', 'Quiz Me'];

export default function AiChatScreen({ route }: any) {
  const { user, token } = useAuthStore();
  const context = route?.params?.context;
  const scrollRef = useRef<ScrollView>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'intro',
      type: 'ai',
      text: context
        ? `I can help you work through ${context.replace('I am reading: ', '')}. Ask for a summary, related sources, or a quiz.`
        : `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I can summarize documents, explain concepts, find related papers, or quiz you on any topic.`,
    },
  ]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const sendMessage = async (preset?: string) => {
    const next = (preset || inputValue).trim();
    if (!next || isLoading) return;

    setMessages((current) => [...current, { id: `${Date.now()}-user`, type: 'user', text: next }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const prompt = context ? `Context: ${context}\n\nQuestion: ${next}` : next;
      const response = await askGemini(prompt, token);
      setMessages((current) => [...current, { id: `${Date.now()}-ai`, type: 'ai', text: response || 'No response received.' }]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-error`, type: 'ai', text: 'I could not reach the assistant service. Try again in a moment.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bot size={22} color={colors.surface} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Research Assistant</Text>
            <Text style={styles.headerSubtitle}>Model: UniLib GPT-4</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow}>
          {QUICK_PROMPTS.map((item) => (
            <TouchableOpacity key={item} onPress={() => sendMessage(item)} style={styles.promptChip}>
              <Text style={styles.promptChipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.dayDivider}>Today</Text>
          {messages.map((message: any) => (
            <View key={message.id} style={message.type === 'user' ? styles.userWrap : styles.aiWrap}>
              {message.type === 'ai' ? <View style={styles.avatar}><Bot size={14} color={colors.primary} /></View> : null}
              <View style={[styles.bubble, message.type === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, message.type === 'user' ? styles.userMessageText : styles.aiMessageText]}>
                  {message.text}
                </Text>
                {message.type === 'ai' ? (
                  <>
                    <View style={styles.sourceChip}>
                      <Text style={styles.sourceChipText}>Source: Ch.3, p.67</Text>
                    </View>
                    <View style={styles.feedbackRow}>
                      <TouchableOpacity style={styles.feedbackButton}>
                        <ThumbsUp size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.feedbackButton}>
                        <ThumbsDown size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.feedbackButton}>
                        <Copy size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          ))}
          {isLoading ? (
            <View style={styles.aiWrap}>
              <View style={styles.avatar}>
                <Bot size={14} color={colors.primary} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
                <Text style={styles.typingText}>typing...</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputRow}>
            <TextInput
              multiline
              placeholder="Ask anything..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
            />
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
              <Send size={18} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  headerSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  promptRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  promptChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
  },
  promptChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  chatContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dayDivider: {
    ...typography.caption,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  aiWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  userWrap: {
    alignSelf: 'flex-end',
    maxWidth: '86%',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: 300,
    borderRadius: 22,
    padding: spacing.lg,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.surface,
  },
  sourceChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
  },
  sourceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  feedbackButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
  },
  typingText: {
    ...typography.caption,
  },
  composer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
