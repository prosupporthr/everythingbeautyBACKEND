export interface TrackingLocation {
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TrackingStatus {
  object_created: string;
  object_updated: string | null;
  object_id: string;
  status: 'UNKNOWN' | 'TRANSIT' | 'DELIVERED' | 'FAILURE' | 'PRE_TRANSIT' | 'RETURNED';
  status_details: string;
  status_date: string;
  substatus: string | null;
  location: TrackingLocation | null;
}

export interface TrackingServiceLevel {
  token: string;
  name: string | null;
}

export interface TrackingData {
  address_from: TrackingLocation;
  address_to: TrackingLocation;
  tracking_status: TrackingStatus;
  tracking_number: string;
  tracking_history: TrackingStatus[];
  carrier: string;
  servicelevel: TrackingServiceLevel;
  metadata: string;
  transaction: string | null;
  messages: any[];
  original_eta: string | null;
  eta: string | null;
  test: boolean;
}

export interface TrackingBodyDto {
  event: string;
  test: boolean;
  data: TrackingData;
}
