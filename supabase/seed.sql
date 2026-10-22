insert into drawings(id,number,title,site,discipline,asset,owner,safety_critical) values
('10000000-0000-4000-8000-000000000001','DW-101','Pump station isolation','Harbour works','Mechanical','PUMP-01','Aroha Reed',true),
('10000000-0000-4000-8000-000000000002','DW-102','Pump station access','Harbour works','Civil','PUMP-01','Aroha Reed',true),
('10000000-0000-4000-8000-000000000003','DW-103','Packing line layout','Valley works','Mechanical','LINE-02','Mason Hill',false)
on conflict do nothing;
insert into revisions(id,drawing_id,revision,sequence,status,file_ref,purpose,risk_ref,safe_use_ref,approved_by,approved_at,decision_ref) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','A',1,'superseded','demo-files/DW-101-A.txt','Isolation arrangement','demo-risk-01','demo-safe-01','Casey North',now()-interval '35 days','demo-review-A'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','B',2,'approved','demo-files/DW-101-B.txt','Updated isolation arrangement','demo-risk-02','demo-safe-02','Casey North',now()-interval '7 days','demo-review-B'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','A',1,'in_review','','Access design','','',null,null,null),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','C',1,'draft','demo-files/DW-103-C.txt','Packing layout','','',null,null,null)
on conflict do nothing;
insert into reviews(id,revision_id,reviewer,due_on,status,evidence,decided_at) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','Casey North',current_date-5,'pending','',null),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Casey North',current_date-8,'accepted','demo-review-B',now()-interval '7 days')
on conflict do nothing;
insert into transmittals(id,reference,recipient,purpose,due_on,recorded_by) values
('40000000-0000-4000-8000-000000000001','TX-101','Harbour maintenance','Recorded handover for isolation planning',current_date-3,'Aroha Reed') on conflict do nothing;
insert into transmittal_items(id,transmittal_id,revision_id) values
('50000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001') on conflict do nothing;
insert into notes(id,drawing_id,actor,body,created_at) values
('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','Mason Hill','Awaiting layout confirmation from operations.',now()-interval '24 days') on conflict do nothing;
