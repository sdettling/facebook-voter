class VotesController < ApplicationController
  def index
    @votes = Vote.all
    respond_to do |format|
      format.json { render json: @votes }
    end
  end
  def create
    Vote.delete_all(:voter => params[:selections][:user])
    Vote.create([{ :voter => params[:selections][:user], :movie => params[:selections][:vote1], :rank => "1" }, { :voter => params[:selections][:user], :movie => params[:selections][:vote2], :rank => "2" }, { :voter => params[:selections][:user], :movie => params[:selections][:vote3], :rank => "3" }])
    respond_to do |format|
      format.json { render json: '{ "status": "success" }',  status: :ok }
    end
  end
end