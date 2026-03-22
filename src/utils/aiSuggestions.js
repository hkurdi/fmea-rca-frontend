const healthcareKeywords = {
    medication: {
      failureModes: [
        'Incomplete medication history collected',
        'Wrong medication dosage recorded',
        'Medication omitted during reconciliation',
        'Duplicate medication entered',
        'Allergy information missed',
      ],
      failureCauses: [
        'No standardized reconciliation protocol',
        'Incomplete patient interview',
        'Poor handoff communication',
        'Medication list unavailable after hours',
        'Staff rushed during intake',
      ],
      failureEffects: [
        'Incorrect medication order placed',
        'Adverse drug interaction risk increased',
        'Delay in treatment decision',
        'Patient safety risk increased',
        'Monitoring plan becomes inaccurate',
      ],
      actions: [
        'Use a medication reconciliation checklist',
        'Require pharmacist review for high-risk cases',
        'Add EHR prompt for allergy confirmation',
        'Standardize after-hours intake workflow',
        'Add double-check step before order entry',
      ],
    },
  
    transfer: {
      failureModes: [
        'Critical patient information not communicated',
        'Lab monitoring instructions missed during transfer',
        'Receiving unit does not confirm handoff details',
        'Transfer note incomplete',
        'Monitoring orders not continued after transfer',
      ],
      failureCauses: [
        'No structured handoff checklist',
        'Verbal handoff incomplete',
        'Documentation delayed',
        'Staffing shortage during shift change',
        'Responsibility for follow-up unclear',
      ],
      failureEffects: [
        'Delay in patient monitoring',
        'Abnormal labs not followed up',
        'Patient deterioration not detected early',
        'Care team confusion',
        'Higher risk of preventable harm',
      ],
      actions: [
        'Use standardized transfer handoff form',
        'Require handoff confirmation by receiving unit',
        'Add alert for pending labs during transfer',
        'Clarify responsibility for monitoring tasks',
        'Use checklist before patient leaves sending unit',
      ],
    },
  
    monitoring: {
      failureModes: [
        'Critical lab not reviewed on time',
        'Monitoring frequency too low',
        'Abnormal result not escalated',
        'Follow-up order not placed',
        'Vital sign trend missed',
      ],
      failureCauses: [
        'No alert for abnormal value',
        'Monitoring plan not documented clearly',
        'Staff unaware of required follow-up',
        'High workload delays review',
        'Communication gap between teams',
      ],
      failureEffects: [
        'Patient condition worsens without intervention',
        'Delayed treatment adjustment',
        'Safety event risk increased',
        'Abnormal trend remains unnoticed',
        'Escalation happens too late',
      ],
      actions: [
        'Add automatic alert for abnormal labs',
        'Create standard monitoring schedule',
        'Assign ownership for follow-up checks',
        'Use escalation protocol for critical values',
        'Review pending labs during shift handoff',
      ],
    },
  };
  
  function detectCategory(text) {
    const value = text.toLowerCase();
  
    if (value.includes('medication') || value.includes('reconciliation') || value.includes('drug')) {
      return 'medication';
    }
  
    if (value.includes('transfer') || value.includes('handoff') || value.includes('admission')) {
      return 'transfer';
    }
  
    if (value.includes('monitor') || value.includes('lab') || value.includes('potassium') || value.includes('vital')) {
      return 'monitoring';
    }
  
    return 'medication';
  }
  
  function pickSuggestions(list, count = 3) {
    return list.slice(0, count);
  }
  
  export function generateHazardSuggestions({ majorProcess = '', subProcess = '' }) {
    const combined = `${majorProcess} ${subProcess}`.trim();
    const category = detectCategory(combined);
    const bank = healthcareKeywords[category];
  
    return {
      category,
      failureModes: pickSuggestions(bank.failureModes),
      failureCauses: pickSuggestions(bank.failureCauses),
      failureEffects: pickSuggestions(bank.failureEffects),
      actions: pickSuggestions(bank.actions),
    };
  }