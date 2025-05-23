import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface GuidebookProps {
  currentScreen: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 300);
const ECODEX_WIDTH = BASE_WIDTH * 2.5;
const ECODEX_HEIGHT = ECODEX_WIDTH * (1190/1920);

const TOTAL_PAGES = 20;

// Create an array of page images
const PAGE_IMAGES = [
  require('../assets/images/ui/Eco-Dex_pg1.png'),
  require('../assets/images/ui/Eco-Dex_pg2.png'),
  require('../assets/images/ui/Eco-Dex_pg3.png'),
  require('../assets/images/ui/Eco-Dex_pg4.png'),
  require('../assets/images/ui/Eco-Dex_pg5.png'),
  require('../assets/images/ui/Eco-Dex_pg6.png'),
  require('../assets/images/ui/Eco-Dex_pg7.png'),
  require('../assets/images/ui/Eco-Dex_pg8.png'),
  require('../assets/images/ui/Eco-Dex_pg9.png'),
  require('../assets/images/ui/Eco-Dex_pg10.png'),
  require('../assets/images/ui/Eco-Dex_pg11.png'),
  require('../assets/images/ui/Eco-Dex_pg12.png'),
  require('../assets/images/ui/Eco-Dex_pg13.png'),
  require('../assets/images/ui/Eco-Dex_pg14.png'),
  require('../assets/images/ui/Eco-Dex_pg15.png'),
  require('../assets/images/ui/Eco-Dex_pg16.png'),
  require('../assets/images/ui/Eco-Dex_pg17.png'),
  require('../assets/images/ui/Eco-Dex_pg18.png'),
  require('../assets/images/ui/Eco-Dex_pg19.png'),
  require('../assets/images/ui/Eco-Dex_pg20.png'),
];

const EXCLUDED_SCREENS = [
  'TitleScreen',
  'LoadSaveScreen',
  'Cutscene_1',
];

export const Guidebook: React.FC<GuidebookProps> = ({ currentScreen }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0); // Changed to 0-based index
  const navigation = useNavigation();

  if (EXCLUDED_SCREENS.includes(currentScreen)) {
    return null;
  }

  const toggleGuidebook = () => {
    setIsExpanded(!isExpanded);
  };

  const nextPage = () => {
    if (currentPage < PAGE_IMAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.guidebookButton, isExpanded && styles.expandedButton]}
        onPress={toggleGuidebook}
      >
        <Image 
          source={require('../assets/images/ui/Guidebook_icon.png')}
          style={styles.iconImage}
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.guidebookWrapper}>
          <View style={styles.mainContainer}>
            <View style={styles.ecodexContainer}>
              <Image
                source={require('../assets/images/ui/eco-dex_bg.png')}
                style={styles.backgroundImage}
                resizeMode="contain"
              />
              <View style={styles.contentOverlay}>
                <Image
                  source={PAGE_IMAGES[currentPage]}
                  style={styles.pageImage}
                  resizeMode="contain"
                />
                <View style={styles.navigationButtons}>
                  <TouchableOpacity 
                    style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
                    onPress={previousPage}
                    disabled={currentPage === 0}
                  >
                    <Text style={styles.navButtonText}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.navButton, currentPage === PAGE_IMAGES.length - 1 && styles.disabledButton]}
                    onPress={nextPage}
                    disabled={currentPage === PAGE_IMAGES.length - 1}
                  >
                    <Text style={styles.navButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={toggleGuidebook}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    padding: 10,
    zIndex: 9999,
    width: '100%',
    height: '70%',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidebookWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  mainContainer: {
    height: ECODEX_HEIGHT + 10, // Added extra space for the close button
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 50,
  },
  ecodexContainer: {
    width: ECODEX_WIDTH,
    height: ECODEX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '5%',
    position: 'absolute',
    top: '20%',
  },
  navButton: {
    backgroundColor: 'rgba(148, 148, 148, 0.21)',
    padding: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    height: 300,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 24,
    color: 'rgba(92, 72, 35, 0.66)',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(250, 225, 179, 0.54)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'rgba(96, 78, 45, 0.74)',
    fontWeight: 'bold',
  },
  guidebookButton: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.05,
    right: SCREEN_WIDTH * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedButton: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  iconImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});

export default Guidebook; 