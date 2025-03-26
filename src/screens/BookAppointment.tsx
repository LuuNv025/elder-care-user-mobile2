import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useBookings } from '../context/BookingsContext';

type BookAppointmentProps = {
  route: RouteProp<RootStackParamList, 'BookAppointment'>;
  navigation: StackNavigationProp<RootStackParamList>;
};

type SuccessModalProps = {
  visible: boolean;
  onDone: () => void;
  appointment: {
    doctorName: string;
    date: string;
    time: string;
  };
};

const timeSlots = [
  ['09:00 AM', '09:30 AM', '10:00 AM'],
  ['10:30 AM', '11:00 AM', '11:30 AM'],
  ['3:00 PM', '3:30 PM', '4:00 PM'],
  ['4:30 PM', '5:00 PM', '5:30 PM'],
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onDone, appointment }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={32} color="#fff" />
        </View>
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.appointmentText}>
          Your appointment with {appointment.doctorName.replace(/^Dr\.\s+/, '')} is confirmed for {appointment.date}, at {appointment.time}.
        </Text>
        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const BookAppointment: React.FC<BookAppointmentProps> = ({ route, navigation }) => {
  const { doctor } = route.params;
  const { addBooking } = useBookings();

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
    setSelectedDate(null);
  };

  const formatAppointmentDate = (year: number, month: number, day: number): string => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const formattedDate = formatAppointmentDate(currentYear, currentMonth, selectedDate);
    
    addBooking({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorImage: doctor.image,
      clinic: doctor.clinic || "Women's Health Clinic",
      date: formattedDate,
      time: selectedTime,
    });

    setShowSuccess(true);
  };

  const handleDone = () => {
    setShowSuccess(false);
    navigation.navigate('MyBookings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2E3A59" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="#2E3A59" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>{monthName} {currentYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color="#2E3A59" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendar}>
          <View style={styles.weekDaysContainer}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysContainer}>
            {Array(firstDayOfMonth).fill(null).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}
            {Array(daysInMonth).fill(null).map((_, index) => {
              const day = index + 1;
              const isSelected = day === selectedDate;
              const isToday = day === today.getDate() && 
                            currentMonth === today.getMonth() && 
                            currentYear === today.getFullYear();

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isToday && styles.today,
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.timeRow}>
                {row.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime === time && styles.selectedTimeText,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedDate || !selectedTime) && styles.confirmButtonDisabled,
        ]}
        onPress={handleConfirm}
        disabled={!selectedDate || !selectedTime}
      >
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

      <SuccessModal
        visible={showSuccess}
        onDone={handleDone}
        appointment={{
          doctorName: doctor.name,
          date: selectedDate ? formatAppointmentDate(currentYear, currentMonth, selectedDate) : '',
          time: selectedTime,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E3A59',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  calendar: {
    marginBottom: 24,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#8F9BB3',
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#2E3A59',
  },
  selectedDay: {
    backgroundColor: '#2E3A59',
    borderRadius: 8,
  },
  selectedDayText: {
    color: '#fff',
  },
  today: {
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
  },
  todayText: {
    color: '#2E3A59',
    fontWeight: '600',
  },
  timeSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 16,
  },
  timeSlots: {
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeSlot: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#2E3A59',
  },
  timeText: {
    fontSize: 14,
    color: '#2E3A59',
  },
  selectedTimeText: {
    color: '#fff',
  },
  confirmButton: {
    margin: 16,
    backgroundColor: '#2E3A59',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#EDF1F7',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 8,
  },
  appointmentText: {
    fontSize: 16,
    color: '#8F9BB3',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#2E3A59',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookAppointment;