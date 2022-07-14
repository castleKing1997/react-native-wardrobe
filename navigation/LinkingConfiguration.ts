/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Dress: {
            screens: {
              DressScreen: 'dress',
            },
          },
          Outfit: {
            screens: {
              OutfitScreen: 'outfit',
            }
          },
          User: {
            screens: {
              UserScreen: 'user',
            }
          }
        },
      },
      DressEdit: 'dress/edit',
      DressDetail: 'dress/detail',
      DressChoose: 'dress/choose',
      OutfitEdit: 'outfit/edit',
      OutfitDetail: 'outfit/detail',
      NotFound: '*',
    },
  },
};

export default linking;
