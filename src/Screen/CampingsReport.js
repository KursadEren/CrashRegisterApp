import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL2 } from '../GroceryData/Constant';

export default function CampingsReport() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_URL2}/campaigns`);
        setCampaigns(response.data.campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Campaigns Report</Text>
      {campaigns.map((campaign) => (
        <View key={campaign.id} style={styles.campaignContainer}>
          <Text style={styles.campaignText}>{campaign.name} - {campaign.discount}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  campaignContainer: {
    marginBottom: 10,
  },
  campaignText: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
