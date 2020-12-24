/**
 * Represents a Multiparty Call Member
 * @constructor
 * @param {function} client - make api call
 * @param {object} [data] - data of phlo
 */
export class UpdateMemberResponse {
	constructor(params: object);
	apiId: string;
	error: string;
}
export class PhloMultiPartyCallMember extends PlivoResource {
	constructor(client: any, data ? : {});
	action: string;
	client: any;
	resumeCall(): Promise < any > ;
	voicemailDrop(): Promise < any > ;
	hangup(): Promise < any > ;
	hold(): Promise < any > ;
    unhold(): Promise<any>;
    update(action: object): Promise<UpdateMemberResponse>;
}
export class PhloMultiPartyCallMemberInterface extends PlivoResourceInterface {
	constructor(client: any, data ? : {});
	action: string;
    client: any;
    get(phloId: string, nodeId: string, memberAddress: string): any;
}
import {
	PlivoResource
} from "../base";
import {
	PlivoResourceInterface
} from "../base";