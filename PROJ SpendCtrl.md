"SpendCtrl" (Hypothetical Project for Expense Management)  
**Project Goal**: Create a platform that issues physical and virtual debit cards to employees, with real-time spending controls and automated expense management.

| Phase | Duration (Est.) | Key Objectives | Marqeta APIs & Features Used | Environment |
| ----- | ----- | ----- | ----- | ----- |
| **MVP (Prototype & Test)** | 1-3 Months | Validate core idea, build a working prototype, simulate key user flows. | **Core API**: User creation, card product configuration, virtual card issuance, JIT (Just-in-Time) Funding logic for transaction controls. | **Public/Private Sandbox** |
| **Pilot Program (Launch & Learn)** | 3-6 Months | Onboard initial real users, process actual transactions, gather feedback, refine features. | **Core API**: Physical card ordering/fulfillment, real-time transaction webhooks, fee assessment (post-transaction), basic reporting. | **Production** |
| **Scaling (Growth & Optimization)** | 6+ Months | Expand user base, add advanced features, optimize performance, ensure compliance. | **Core API**: Advanced controls (e.g., specific merchant/MCC restrictions), **DiVA API**: detailed analytics/reporting, full compliance features. | **Production** |

Phase 1: MVP \- Core Functionality in the Sandbox  
The MVP phase focuses on the essential "card issuing with control" concept using the **Marqeta Sandbox** environment.

* **API Access**: Free sign-up to the public sandbox, providing full access to Core APIs and test credentials.  
* **Key Integrations**:  
  * **User API**: `POST /users` to create employee accounts in the Marqeta system.  
  * **Card Product API**: Define a "card product" with initial rules (e.g., daily limits).  
  * **Cards API**: `POST /cards` to instantly issue virtual cards for each user.  
  * **JIT Funding**: Integrate with the JIT Funding webhook endpoint to allow real-time authorization decisions based on custom business logic (e.g., checking if the purchase is for an approved vendor).  
* **Outcome**: A functional prototype that can simulate the entire transaction lifecycle in a risk-free environment using the built-in simulation tools.

Phase 2: Pilot Program \- Transition to Production  
Once the MVP is validated, the project transitions to a live, production environment to onboard the first set of real users. This requires a signed contract and a move to Marqeta's enterprise infrastructure.

* **API Access**: Full production API access via negotiated MSA and SOW. Pricing is usage-based (transaction volume and interchange sharing).  
* **Key Integrations (Additions/Changes)**:  
  * **Physical Cards**: Integrate with fulfillment partners via the API to order and ship physical cards.  
  * **Real-Time Webhooks**: Set up production webhooks to receive real transaction data and power the JIT funding logic in real time.  
  * **Fee/GPA API**: Begin assessing small fees (e.g., ATM fees) in real time or post-transaction using `realtimefeegroups` or `feetransfers` endpoints.  
  * **Basic Reporting**: Start pulling initial transaction data for reconciliation.  
* **Outcome**: A live, compliant card program with real financial flows and a small, active user base providing real-world feedback.

Phase 3: Scaling & Enterprise Features \- Optimization and Growth  
As the user base grows, the focus shifts to efficiency, advanced features, and deeper data insights. The usage-based model naturally scales the cost/revenue with volume.

* **API Access**: Continued full platform access, with pricing reflecting higher transaction volumes and potentially better interchange sharing terms.  
* **Key Integrations (Additions/Changes)**:  
  * **DiVA API**: Utilize this separate API for complex data analytics and comprehensive reporting beyond basic transaction queries, helping to identify spending patterns and fraud trends.  
  * **Advanced Controls**: Implement highly granular controls, such as daily spending limits per merchant category code (MCC) or time of day restrictions.  
  * **Compliance & Security**: Leverage Marqeta's tokenization and security features for large-scale operations and regulatory reporting requirements.  
  * **Infrastructure**: Focus on scalable cloud infrastructure (e.g., using AWS for the backend) to handle increased API call volume and ensure low latency for JIT decisions.  
* **Outcome**: A stable, scalable, enterprise-ready platform capable of managing a large number of cardholders with sophisticated financial controls and valuable data insights.