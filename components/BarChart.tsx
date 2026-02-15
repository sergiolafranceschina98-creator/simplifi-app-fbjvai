
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export default function BarChart({
  data,
  maxValue,
  height = 200,
  showValues = true,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { height }]}>
        {data.map((item, index) => (
          <BarItem
            key={index}
            label={item.label}
            value={item.value}
            maxValue={max}
            color={item.color || colors.primary}
            height={height}
            index={index}
            showValue={showValues}
          />
        ))}
      </View>
    </View>
  );
}

interface BarItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  height: number;
  index: number;
  showValue: boolean;
}

function BarItem({ label, value, maxValue, color, height, index, showValue }: BarItemProps) {
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withDelay(
      index * 100,
      withTiming((value / maxValue) * (height - 40), {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    animatedOpacity.value = withDelay(
      index * 100,
      withTiming(1, {
        duration: 500,
      })
    );
  }, [value, maxValue, height, index, animatedHeight, animatedOpacity]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: animatedOpacity.value,
  }));

  const animatedValueStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));

  const valueText = value.toString();

  return (
    <View style={styles.barContainer}>
      <View style={styles.barWrapper}>
        {showValue && (
          <Animated.View style={[styles.valueContainer, animatedValueStyle]}>
            <Text style={styles.valueText}>{valueText}</Text>
          </Animated.View>
        )}
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: color,
            },
            animatedBarStyle,
          ]}
        />
      </View>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  valueContainer: {
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
