export interface ShippoAddress {
  country: string;
  name: string;
  company: string;
  street1: string;
  street2?: string;
  street3?: string;
  street_no?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  is_residential?: boolean;
  metadata?: string;
  is_complete?: boolean;
  latitude?: number;
  longitude?: number;
  object_created?: string;
  object_id?: string;
  object_owner?: string;
  object_updated?: string;
  validation_results?: {
    is_valid: boolean;
    messages: {
      code: string;
      source: string;
      text: string;
      type: string;
    }[];
  };
  test?: boolean;
}

export interface ShippoMessage {
  source: string;
  code: string;
  text: string;
}

export interface ShippoParcel {
  mass_unit: string;
  weight: string;
  distance_unit: string;
  height: string;
  length: string;
  width: string;
  extra?: {
    COD?: {
      amount: string;
      currency: string;
      payment_method: string;
    };
    insurance?: {
      amount: string;
      content: string;
      currency: string;
      provider: string;
    };
    reference_1?: string;
    reference_2?: string;
  };
  metadata?: string;
  object_created?: string;
  object_id?: string;
  object_owner?: string;
  object_state?: string;
  object_updated?: string;
  template?: string;
  test?: boolean;
}

export interface ShippoRate {
  amount: string;
  amount_local: string;
  currency: string;
  currency_local: string;
  attributes: string[];
  carrier_account: string;
  object_created: string;
  object_id: string;
  object_owner: string;
  provider: string;
  servicelevel: {
    name: string;
    terms?: string;
    token: string;
    extended_token?: string;
    parent_servicelevel?: {
      name: string;
      terms?: string;
      token: string;
      extended_token?: string;
    };
  };
  shipment: string;
  arrives_by?: string;
  duration_terms?: string;
  estimated_days?: number;
  included_insurance_price?: string;
  messages?: ShippoMessage[];
  provider_image_75?: string;
  provider_image_200?: string;
  test?: boolean;
  zone?: string;
}

export interface ShipmentReturnType {
  metadata?: string;
  address_from: ShippoAddress;
  address_to: ShippoAddress;
  carrier_accounts: string[];
  messages: ShippoMessage[];
  object_created: string;
  object_id: string;
  object_owner: string;
  object_updated: string;
  parcels: ShippoParcel[];
  rates: ShippoRate[];
  status: string;
  extra?: {
    accounts_receivable_customer_account?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    alcohol?: {
      contains_alcohol: boolean;
      recipient_type: string;
    };
    ancillary_endorsement?: string;
    appropriation_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    authority_to_leave?: boolean;
    bill_of_lading_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    billing?: {
      account: string;
      country: string;
      participation_code: string;
      type: string;
      zip: string;
    };
    bypass_address_validation?: boolean;
    carbon_neutral?: boolean;
    carrier_hub_id?: string;
    carrier_hub_travel_time?: number;
    COD?: {
      amount: string;
      currency: string;
      payment_method: string;
    };
    cod_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    container_type?: string;
    critical_pull_time?: string;
    customer_branch?: string;
    customer_reference?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    dangerous_goods?: {
      contains: boolean;
      biological_material?: {
        contains: boolean;
      };
      lithium_batteries?: {
        contains: boolean;
      };
    };
    dangerous_goods_code?: string;
    dealer_order_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    delivery_instructions?: string;
    dept_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    dry_ice?: {
      contains_dry_ice: boolean;
      weight: string;
    };
    fda_product_code?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    fulfillment_center?: string;
    insurance?: {
      amount: string;
      content: string;
      currency: string;
      provider: string;
    };
    invoice_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    is_return?: boolean;
    lasership_attrs?: string[];
    lasership_declared_value?: string;
    manifest_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    model_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    part_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    po_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    preferred_delivery_timeframe?: string;
    premium?: boolean;
    production_code?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    purchase_request_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    qr_code_requested?: boolean;
    reference_1?: string;
    reference_2?: string;
    request_retail_rates?: boolean;
    return_service_type?: string;
    rma_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    saturday_delivery?: boolean;
    salesperson_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    serial_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    signature_confirmation?: string;
    store_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    transaction_reference_number?: {
      prefix: string;
      value: string;
      ref_sort: number;
    };
    usmca_eligible?: boolean;
  };
  shipment_date: string;
  address_return?: ShippoAddress;
  customs_declaration?: {
    certify: boolean;
    certify_signer: string;
    contents_type: string;
    items: string[];
    non_delivery_option: string;
    aes_itn?: string;
    b13a_filing_option?: string;
    b13a_number?: string;
    certificate?: string;
    commercial_invoice?: boolean;
    contents_explanation?: string;
    disclaimer?: string;
    duties_payor?: {
      account: string;
      type: string;
      address: {
        name: string;
        zip: string;
        country: string;
      };
    };
    exporter_identification?: {
      eori_number?: string;
      tax_id?: {
        number: string;
        type: string;
      };
    };
    exporter_reference?: string;
    importer_reference?: string;
    is_vat_collected?: boolean;
    invoice?: string;
    license?: string;
    metadata?: string;
    notes?: string;
    address_importer?: string;
    eel_pfc?: string;
    incoterm?: string;
    invoiced_charges?: {
      currency: string;
      total_shipping: string;
      total_taxes: string;
      total_duties: string;
      other_fees: string;
    };
    object_created: string;
    object_id: string;
    object_owner: string;
    object_state: string;
    object_updated: string;
    test: boolean;
  };
  test: boolean;
}
