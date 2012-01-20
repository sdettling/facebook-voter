class VotesController < ApplicationController
  def create
    @vote = Vote.new(params[:vote])
    respond_to do |format|
      if @vote.save
        format.json { render json: @vote }
      else
        format.json { render json: @vote.errors, status: :unprocessable_entity }
      end
    end
  end
  def create
    #@user = params[:selections][:user]
    Vote.delete_all(:voter => params[:selections][:user])
    Vote.create([{ :voter => params[:selections][:user], :movie => params[:selections][:vote1], :rank => "1" }, { :voter => params[:selections][:user], :movie => params[:selections][:vote2], :rank => "2" }, { :voter => params[:selections][:user], :movie => params[:selections][:vote3], :rank => "3" }])
    respond_to do |format|
      format.json { render json: '{ "status": "success" }',  status: :ok }
    end
  end

end