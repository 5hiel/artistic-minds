import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LevelColorContext } from '@/src/components/ui/levelColor';

interface NumberSeriesRendererProps {
  series: number[];
  hiddenIndex?: number; // Index of the hidden number (optional, for showing complete series)
}

const NumberSeriesRenderer: React.FC<NumberSeriesRendererProps> = ({ 
  series, 
  hiddenIndex 
}) => {
  const { cellColor } = useContext(LevelColorContext);
  
  return (
    <View style={styles.seriesContainer}>
      <View style={styles.seriesRow}>
        {series.map((number, index) => (
          <React.Fragment key={index}>
            <View 
              style={[
                styles.numberCell, 
                { backgroundColor: cellColor },
                hiddenIndex === index && styles.hiddenCell
              ]}
            >
              <Text style={[
                styles.numberText,
                { color: '#f0e2edff' },
                hiddenIndex === index && styles.hiddenText
              ]}>
                {hiddenIndex === index ? '?' : number}
              </Text>
            </View>
            {index < series.length - 1 && (
              <Text style={styles.separator}>,</Text>
            )}
          </React.Fragment>
        ))}
        {hiddenIndex === series.length && (
          <>
            <Text style={styles.separator}>,</Text>
            <View style={[styles.numberCell, styles.hiddenCell, { backgroundColor: cellColor }]}>
              <Text style={[styles.numberText, styles.hiddenText, { color: '#f0e2edff' }]}>
                ?
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seriesContainer: {
    marginVertical: 20,
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  seriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  numberCell: {
    minWidth: 50,
    height: 50,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  hiddenCell: {
    borderColor: '#F56565', // Red border for hidden cells
    borderWidth: 3,
    backgroundColor: 'rgba(245, 101, 101, 0.1)', // Light red background
  },
  numberText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  hiddenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F56565', // Red color for question marks
  },
  separator: {
    fontSize: 18,
    color: '#A0AEC0',
    marginHorizontal: 2,
  },
});

export default NumberSeriesRenderer;